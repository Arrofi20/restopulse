---
phase: 02-dashboard
plan: 01
subsystem: api
tags: [express, cors, prisma, jwt, cqrs-lite, dashboard, zod]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "JWT authMiddleware + AuthenticatedRequest, SalesTrendRepository.findByDateRange, dateRangeSchema, prisma singleton, Sales Controller/Service/route patterns"
provides:
  - "GET /api/dashboard endpoint (JWT-protected, outlet-scoped trends + summary)"
  - "SalesTrendRepository.aggregateSummary (Prisma _sum/_count over date range)"
  - "DashboardService (date validation + trend/summary aggregation + outlet name)"
  - "DashboardController + dashboard.routes.ts (singleton DI pattern)"
  - "Explicit CORS config for Vite dev origin (localhost:5173)"
affects:
  - 02-dashboard
  - frontend-dashboard
  - all-cors-consumers

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "singleton-controller-with-DI (mirrors SalesController: getInstance() -> new Controller(new Service(new Repository())))"
    - "CQRS-lite dashboard read: pre-computed SalesTrend rows + Prisma aggregate for O(1) reads"
    - "reuse-existing-validation: dateRangeSchema shared between sales and dashboard"
    - "JSON-parse-on-read: menu_popularity string -> object at the service boundary"

key-files:
  created:
    - src/services/DashboardService.ts
    - src/controllers/DashboardController.ts
    - src/routes/dashboard.routes.ts
  modified:
    - src/app.ts
    - src/repositories/SalesTrendRepository.ts

key-decisions:
  - "Reused existing dateRangeSchema from sales.schema instead of creating a dashboard-specific validator (DRY, single source of truth for date-range rules)"
  - "DashboardService resolves outlet name via prisma.outlet.findUnique to satisfy D-17/D-18 (frontend header) without a new repository"
  - "Errors bubble from service to controller; controller maps ZodError -> 400 VALIDATION_ERROR and all other errors -> 400 DASHBOARD_ERROR (analogous to SalesController's SALES_ERROR)"
  - "CORS origin read from CORS_ORIGIN env with http://localhost:5173 dev fallback; credentials: true for future cookie/JWT flows"
  - "No rate limiting on dashboard routes (T-02-04 accepted: pre-computed SalesTrend makes wide ranges O(1) reads)"

patterns-established:
  - "Dashboard read path: Controller -> Service (validate + query + aggregate + parse JSON) -> Repository, mirroring the Sales vertical"
  - "Aggregate-summary repository method returning { totalRevenue, transactionCount } with || 0 null-coalescing"

requirements-completed:
  - DASH-01
  - DASH-02

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "GET /api/dashboard?start=&end= endpoint mounted and JWT-protected via authMiddleware"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit --skipLibCheck (exit 0) — compile-time confirmation of route/middleware wiring"
        status: pass
      - kind: manual_procedural
        ref: "PLAN.md <verification>: curl /api/dashboard without token -> 401; with login token -> 200"
        status: unknown
    human_judgment: true
    rationale: "No unit/integration test suite exists for this plan; the 401-without-token and 200-with-token contract requires a running server, seeded DB, and live login flow that was not executed during this run."
  - id: D2
    description: "Dashboard response shape { success, data: { outlet: { name }, trends: [...], summary: { totalRevenue, transactionCount } } } with menu_popularity parsed from JSON string"
    requirement: DASH-02
    verification:
      - kind: other
        ref: "npx tsc --noEmit --skipLibCheck (exit 0)"
        status: pass
      - kind: manual_procedural
        ref: "PLAN.md <verification>: curl with token -> jq .data.{outlet,trends,summary}"
        status: unknown
    human_judgment: true
    rationale: "Response shape and JSON.parse of menu_popularity are only provable via a live request against seeded SalesTrend rows; not covered by an automated test in this plan."
  - id: D3
    description: "CORS explicitly configured for Vite dev origin (http://localhost:5173) with credentials"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "src/app.ts lines 15-20 — cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true })"
        status: pass
    human_judgment: true
    rationale: "Actual CORS preflight header behavior (Access-Control-Allow-Origin/Allow-Credentials returned to the browser) requires a live HTTP OPTIONS exchange against the dev server; static inspection confirms config presence but not runtime header emission."
  - id: D4
    description: "Malformed date range rejected with 400 VALIDATION_ERROR"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit --skipLibCheck (exit 0) — ZodError -> 400 VALIDATION_ERROR branch compiles"
        status: pass
      - kind: manual_procedural
        ref: "PLAN.md <verification>: curl /api/dashboard?start=foo&end=bar with token -> 400 VALIDATION_ERROR"
        status: unknown
    human_judgment: true
    rationale: "The 400-on-malformed-date contract requires a live request to exercise Zod parse + controller catch branch; no automated test covers it."

# Metrics
duration: ~10 min
completed: 2026-06-26T03:17:47Z
status: complete
---

# Phase 02 Plan 01: Dashboard API + CORS Summary

**GET /api/dashboard endpoint with JWT-scoped outlet trends + aggregate summary, plus explicit CORS config for the Vite dev origin**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-26T03:10:23Z (Task 1 commit)
- **Completed:** 2026-06-26T03:17:47Z
- **Tasks:** 3/3
- **Files modified:** 5 (2 created controllers/routes + 1 created service + 2 modified app.ts/SalesTrendRepository)

## Accomplishments

- **Fixed CORS** in `src/app.ts`: replaced bare `app.use(cors())` with explicit `cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true })` so the Phase 2 Vite frontend can call the API (closes CORS pitfall from 02-RESEARCH.md).
- **Added `aggregateSummary`** to `SalesTrendRepository`: Prisma `aggregate` over the date range scoped to `outlet_id`, returning `{ totalRevenue, transactionCount }` with `|| 0` null-coalescing — the summary half of the dashboard payload.
- **Created `DashboardService`**: validates `start`/`end` with the existing `dateRangeSchema` (DRY reuse), parses UTC day boundaries, queries pre-computed `SalesTrend` rows + aggregate summary, `JSON.parse`s `menu_popularity` per row, and resolves the outlet name for the frontend header (D-17/D-18).
- **Created `DashboardController`**: singleton `getInstance()` DI chain (`new DashboardController(new DashboardService(new SalesTrendRepository()))`), `getDashboard` extracts `outletId` from `req.user`, maps `ZodError` -> 400 `VALIDATION_ERROR` and other errors -> 400 `DASHBOARD_ERROR`.
- **Created `dashboard.routes.ts`** and mounted at `/api/dashboard` in `app.ts` (between `/api/sales` and `/api/admin`), protected by `authMiddleware`.
- **TypeScript compiles clean**: `npx tsc --noEmit --skipLibCheck` exits 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix CORS and add aggregateSummary to SalesTrendRepository** - `2961100` (feat)
2. **Task 2: Create DashboardService** - `a27ab66` (feat)
3. **Task 3: Create DashboardController, routes, and mount in app.ts** - `5158b59` (feat)

_Plan metadata commit recorded separately below._

## Files Created/Modified

- `src/app.ts` - CORS config + import/mount of `dashboardRoutes` at `/api/dashboard`
- `src/repositories/SalesTrendRepository.ts` - new `aggregateSummary(outlet_id, start, end)` method (Prisma `_sum`/`_count`)
- `src/services/DashboardService.ts` - `getDashboard(outlet_id, start, end)`: validate -> query trends -> aggregate summary -> parse JSON -> resolve outlet name
- `src/controllers/DashboardController.ts` - singleton controller, `getDashboard` handler with ZodError/DASHBOARD_ERROR mapping
- `src/routes/dashboard.routes.ts` - `GET /` with `authMiddleware`, bound controller handler

## Decisions Made

- **Reused `dateRangeSchema`** from `../validation/sales.schema` rather than creating a dashboard-specific validator — single source of truth for date-range rules, shared with the sales vertical.
- **Outlet name resolved in the service** via `prisma.outlet.findUnique({ select: { name: true } })` instead of a new `OutletRepository` — a one-line read doesn't justify a new repository for v1.
- **Error mapping mirrors `SalesController`**: `ZodError` -> 400 `VALIDATION_ERROR` with `error.issues`; all other errors -> 400 `DASHBOARD_ERROR` (analogous to `SALES_ERROR`). Service lets Prisma/Zod errors bubble.
- **No dashboard rate limiting** — T-02-04 (DoS) accepted per threat model: dashboard reads pre-computed `SalesTrend` rows, so wide date ranges are O(1)-ish reads, not expensive aggregations.

## Deviations from Plan

None - plan executed exactly as written. (Tasks 1 and 2 were committed by a prior execution wave; Task 3 was completed and committed in this run with no deviation from the plan's `<action>` spec.)

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. CORS origin defaults to `http://localhost:5173`; set `CORS_ORIGIN` in `.env` to allow a different frontend origin in non-dev environments.

## Threat Mitigations

| Threat | Mitigation | Status |
|--------|------------|--------|
| T-02-01 (Spoofing, /api/dashboard) | `authMiddleware` on `GET /`; all queries scoped to decoded `req.user.outletId` | Implemented (route + controller + repository `outlet_id` scoping) |
| T-02-02 (Tampering, CORS) | Explicit `cors({ origin, credentials })` replaces bare `cors()` | Implemented in `src/app.ts` |
| T-02-03 (Info Disclosure, /api/dashboard) | Financial data scoped to authenticated outlet only; no cross-outlet leakage | Implemented (`outlet_id` filter on both `findByDateRange` and `aggregateSummary`) |
| T-02-04 (DoS, /api/dashboard) | Accepted — pre-computed SalesTrend reads | Accepted (no rate limit, per plan) |
| T-02-05 (EoP, authMiddleware) | Reuses Phase 1 Bearer-token middleware | Inherited from Phase 1 |

## Known Stubs

None. The dashboard endpoint is fully wired: controller -> service -> repository -> Prisma, with real outlet name resolution and JSON parsing. No placeholder/TODO/mock data in the request path.

## Self-Check: PASSED

- All 5 referenced source files exist on disk (`src/app.ts`, `src/repositories/SalesTrendRepository.ts`, `src/services/DashboardService.ts`, `src/controllers/DashboardController.ts`, `src/routes/dashboard.routes.ts`).
- All 3 task commits found in git history: `2961100`, `a27ab66`, `5158b59`.
- `npx tsc --noEmit --skipLibCheck` exits 0 (re-confirmed post-commit).

## Next Phase Readiness

- Dashboard backend endpoint is live and JWT-protected; the Phase 2 frontend (plans 02-02 .. 02-05) can now call `GET /api/dashboard?start=&end=` and render `{ outlet, trends, summary }`.
- **Pending verification (human/UAT):** the live curl contract from the plan's `<verification>` block was not executed in this run (no running server / seeded login). Before declaring Phase 02 done, verify: (1) 401 without token, (2) 200 with token returns the expected shape, (3) malformed dates -> 400 `VALIDATION_ERROR`, (4) a CORS preflight from `localhost:5173` succeeds. These are flagged in the `coverage` block as `human_judgment: true`.
- No blockers.

---
*Phase: 02-dashboard*
*Completed: 2026-06-26*
