---
phase: 03-e-report-engine
plan: 01
subsystem: api
tags: [express, prisma, report, zod, jwt]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Express app skeleton, JWT authMiddleware, SalesTrend + DailySales Prisma models, dateRangeSchema
  - phase: 02-dashboard-mvp
    provides: Dashboard controller/service/route pattern reused verbatim, CORS config, sales.schema dateRangeSchema
provides:
  - GET /api/report endpoint returning outlet-scoped aggregated report (outlet, period, summary, rows)
  - ReportRepository unifying SalesTrend (revenue + menu popularity) and DailySales (transaction presence per day) reads
  - ReportService with DRY date-range validation
  - ReportController mirroring DashboardController's error-mapping conventions (VALIDATION_ERROR / REPORT_ERROR)
affects: [03-02 (report preview UI), 03-03 (PDF export engine), 03-04 (CSV export engine)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Report repository pattern: one repository unifies two Prisma tables for a single report shape"
    - "Controller mirroring: ReportController.GetInstance mirrors DashboardController for consistent error mapping"

key-files:
  created:
    - src/repositories/ReportRepository.ts
    - src/services/ReportService.ts
    - src/controllers/ReportController.ts
    - src/routes/report.routes.ts
  modified:
    - src/repositories/index.ts
    - src/app.ts

key-decisions:
  - "Per-day dayCount derived from DailySales record presence (1/0), not a per-row count — DailySales schema has no transaction_count column and @@unique([outlet_id, date]) makes each daily record the transaction unit; period summary.dayCount = number of days with recorded sales"
  - "Live queries against SalesTrend + DailySales (per D-31/D-33b); the DailySalesReport cached snapshot table is intentionally unused because it has no population mechanism yet"
  - "Per-row topMenu = first item of that day's parsed menu_popularity items sorted by count desc ('-' if empty); period topItems = top 3 names by summed count across all days"
  - "Reused existing dateRangeSchema (DRY) for input validation, mirroring the Phase 2 dashboard pattern"

patterns-established:
  - "Report repository pattern: one repository unifies two Prisma tables for a single report shape"
  - "Tolerant JSON parsing helper (safeParseMenuPopularity) for menu_popularity string fields"

requirements-completed: [REPT-01]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "GET /api/report endpoint returning aggregated report data scoped to the authenticated outlet"
    requirement: "REPT-01"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit --skipLibCheck (exits 0)"
        status: pass
      - kind: manual_procedural
        ref: "grep '/api/report' src/app.ts -> 1 mount; grep authMiddleware src/routes/report.routes.ts present"
        status: pass
    human_judgment: true
    rationale: "Endpoint responses (200/400/401 + payload shape + outlet scoping) verified by static compile + route wiring grep; full HTTP behavior with seeded data is deferred to UAT since no integration test infrastructure is wired in this plan"
  - id: D2
    description: "ReportRepository aggregating SalesTrend + DailySales into structured rows with top items"
    requirement: "REPT-01"
    verification:
      - kind: unit
        ref: "npx tsc --noEmit --skipLibCheck (exits 0, ReportRepository compiles and is re-exported from src/repositories/index.ts)"
        status: pass
    human_judgment: true
    rationale: "Behavioral correctness of menu_popularity parsing, top-items aggregation, and transaction-count join requires seeded-database verification at UAT; tsc only proves the contract compiles"
  - id: D3
    description: "Invalid date ranges return 400 VALIDATION_ERROR with structured error details"
    requirement: "REPT-01"
    verification:
      - kind: manual_procedural
        ref: "grep VALIDATION_ERROR + REPORT_ERROR mappings in src/controllers/ReportController.ts"
        status: pass
    human_judgment: true
    rationale: "Actual 400-with-ZodError-issues response must be exercised against a running server at UAT; static grep confirms the mapping wiring only"

# Metrics
duration: 3 min
completed: 2026-06-26
status: complete
---

# Phase 3 Plan 01: E-Report API Summary

**GET /api/report endpoint aggregating SalesTrend + DailySales into outlet-scoped report data with summary and daily breakdown, validated by the shared dateRangeSchema**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-26T08:52:00Z
- **Completed:** 2026-06-26T08:55:50Z
- **Tasks:** 3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- ReportRepository unifies SalesTrend (revenue + menu_popularity) and DailySales (per-day transaction presence) into a structured `{ rows, topItems }` payload scoped to a single outlet
- ReportService validates the date range via the shared `dateRangeSchema`, computes period totals (`totalRevenue`, `dayCount`), resolves the outlet name, and returns `{ outlet, period, summary, rows }`
- ReportController mirrors DashboardController (ZodError -> 400 VALIDATION_ERROR, other errors -> 400 REPORT_ERROR) and is mounted at `GET /api/report` between `/api/dashboard` and `/api/admin`, protected by `authMiddleware`
- All queries scoped to `req.user.outletId` — owners cannot read other outlets' data (T-03-02 mitigated)

## Task Commits

Each task was committed atomically:

1. **Task 1: ReportRepository** - `c1fdb03` (feat)
2. **Task 2: ReportService** - `43788a3` (feat)
3. **Task 3: ReportController + route + app.ts mount** - `2444436` (feat)

**Plan metadata:** (committed in final `docs(03-01)` commit below)

## Files Created/Modified
- `src/repositories/ReportRepository.ts` - Aggregates SalesTrend + DailySales into ReportRow[] + topItems string[]
- `src/services/ReportService.ts` - Validates inputs, orchestrates repo, computes summary, resolves outlet name
- `src/controllers/ReportController.ts` - Express handler with getInstance factory + ZodError/error mapping
- `src/routes/report.routes.ts` - `GET /` route behind authMiddleware
- `src/repositories/index.ts` - Re-exports ReportRepository + ReportRow/ReportData types
- `src/app.ts` - Mounts `/api/report` between `/api/dashboard` and `/api/admin`

## Decisions Made
- **Per-day dayCount = 1 if a DailySales record exists for that date else 0** — DailySales schema has no `transaction_count` column and `@@unique([outlet_id, date])` makes each daily record the transaction unit; period summary.dayCount is therefore the number of days with recorded sales
- **Live queries against SalesTrend + DailySales** (per D-31/D-33b) — the DailySalesReport cached snapshot table has no population mechanism yet and is intentionally unused
- **Per-row topMenu + period topItems** semantics: per-row topMenu is the highest-count item in that day's parsed `menu_popularity.items` (sorted desc; `"-"` if empty); period `topItems` is the top 3 names by summed count across all days
- **Reused `dateRangeSchema`** (DRY) for input validation, mirroring the existing Phase 2 dashboard pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Schema mismatch on DailySales transaction_count**
- **Found during:** Task 1 (ReportRepository.getReportData)
- **Issue:** Plan Task 1 step 3 specifies `dayCount (number from matching DailySales row by date, or 0 if no match)` — implying a numeric column on DailySales. The DailySales Prisma model has no `transaction_count` field; its `@@unique([outlet_id, date])` constraint means at most one record per outlet per day, which makes the daily record itself the transaction unit, not an aggregate count
- **Fix:** Derived per-day `dayCount` from DailySales record presence (1 when a matching row exists for that date, 0 otherwise). The period `summary.dayCount` then sums these, which equals the number of days with recorded sales across the range
- **Files modified:** src/repositories/ReportRepository.ts
- **Verification:** `npx tsc --noEmit --skipLibCheck` exits 0; traceable via Date-request-count join index (`dayCountByDate`)
- **Committed in:** c1fdb03 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 3 blocking — schema mismatch resolved to keep plan semantically consistent without scope creep)
**Impact on plan:** The endpoint's contract (outlet, period, summary, rows) is unchanged; only the numeric meaning of `dayCount` was clarified against the actual schema. No scope creep; the report shape in the plan's `must_haves.truths` still holds.

## Issues Encountered
None — all three tasks compiled on first attempt; the only deviation (schema mismatch) was resolved inline as Rule 3.

## User Setup Required
None - no external service configuration required. The endpoint reads only from the existing SQLite database via Prisma.

## Threat Flags
None new beyond the plan's `<threat_model>`:
- T-03-01 (Spoofing): mitigated via `authMiddleware` on the route (confirmed in src/routes/report.routes.ts)
- T-03-02 (Information Disclosure): mitigated — every Prisma query is scoped to `req.user.outletId` (ReportController.getReport + ReportService.getReport + ReportRepository.getReportData)
- T-03-03 (Tampering): mitigated via `dateRangeSchema` Zod validation (format + start<=end)
- T-03-04 (DoS): accepted (pre-computed SalesTrend makes queries O(rows) in date range)

## Next Phase Readiness
- Backend report API is ready for the report preview UI (plan 03-02) and export engines (plans 03-03, 03-04)
- The report payload shape (`{ outlet, period, summary: { totalRevenue, dayCount, topItems }, rows: [{ date, revenue, topMenu, dayCount }] }`) is the contract for those downstream consumers
- No blockers

## Self-Check: PASSED
- `src/repositories/ReportRepository.ts` exists: FOUND
- `src/services/ReportService.ts` exists: FOUND
- `src/controllers/ReportController.ts` exists: FOUND
- `src/routes/report.routes.ts` exists: FOUND
- commit c1fdb03 (Task 1) in git log: FOUND
- commit 43788a3 (Task 2) in git log: FOUND
- commit 2444436 (Task 3) in git log: FOUND
- `npx tsc --noEmit --skipLibCheck` exits 0: PASS
- `grep -c "ReportRepository" src/repositories/index.ts` returns >= 1: PASS (3)
- `grep -c "/api/report" src/app.ts` returns >= 1: PASS (1)
- ReportController maps ZodError to VALIDATION_ERROR and other errors to REPORT_ERROR: PASS

---
*Phase: 03-e-report-engine*
*Completed: 2026-06-26*