---
phase: 03-e-report-engine
plan: 02
subsystem: ui
tags: [react, vite, typescript, report, date-fns, tailwind]

# Dependency graph
requires:
  - phase: 02-dashboard-mvp
    provides: DateFilter/SummaryCards component patterns, useDashboard/usePolling hooks, formatRupiah, apiClient Bearer-token wrapper
  - phase: 03-e-report-engine
    provides: GET /api/report endpoint contract (outlet, period, summary, rows)
provides:
  - E-Report preview page at /e-report with independent date filtering, summary cards, daily breakdown table, and sticky export button area
  - useReport hook polling GET /api/report every 30s (independent date state, D-21)
  - ReportDateFilter with Harian/Mingguan/Bulanan/Custom presets + defaultReportDateRange() (D-19/D-20)
  - ReportSummaryCards (Total Omset / Hari Tercatat / Menu Terlaris) and ReportDailyTable components
  - ExportButtons placeholder component (sticky, mobile-responsive) ready for 03-03/03-04 handler wiring
affects: [03-03 (PDF export engine), 03-04 (CSV export engine)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Report page mirrors dashboard page composition: hook owns fetch/poll, page owns date state, components are presentational"
    - "Independent date state per page (D-21) — EReportPage useState is separate from DashboardPage useState"
    - "ExportButtons accepts optional handlers so export engines can wire in without modifying layout"

key-files:
  created:
    - frontend/src/types/report.ts
    - frontend/src/hooks/useReport.ts
    - frontend/src/hooks/__tests__/useReport.test.ts
    - frontend/src/components/report/ReportDateFilter.tsx
    - frontend/src/components/report/ReportSummaryCards.tsx
    - frontend/src/components/report/ReportDailyTable.tsx
    - frontend/src/components/report/ExportButtons.tsx
  modified:
    - frontend/src/pages/EReportPage.tsx

key-decisions:
  - "useReport mirrors useDashboard verbatim (30s poll, useCallback fetcher keyed on date range, refresh() flips loading) — only the endpoint path differs (/report vs /dashboard). No new abstractions introduced."
  - "ReportDateFilter drops the dashboard 'Semua' preset and adds 'Harian' (today only) per D-19; 'Bulanan' (current month) is the default per D-20, exported via defaultReportDateRange() so the preset is highlighted on first paint (same fix as 02-04's defaultDateRange)."
  - "ReportDailyTable uses overflow-x-auto for mobile horizontal scroll rather than collapsing columns — preserves all four columns (Tanggal, Omset, Menu Terlaris, Hari Tercatat) required by D-23."
  - "ExportButtons handlers are optional props; buttons disable when handler is absent OR data is null. This keeps the component stable across 03-03 (PDF) and 03-04 (CSV) — those plans only need to pass callbacks."
  - "Independent report date state lives in EReportPage via useState(defaultReportDateRange()) — NOT lifted to a shared store, satisfying D-21 (report and dashboard date states must not bleed)."

patterns-established:
  - "Report page = hook(poll) + date filter + presentational cards/table; no data fetching inside child components"
  - "Sticky export bar with backdrop-blur for action areas that must stay visible during scroll"

requirements-completed: [REPT-01]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "E-Report preview page at /e-report with date filter, summary cards, daily table, and sticky export area"
    requirement: "REPT-01"
    verification:
      - kind: integration
        ref: "cd frontend && npm run build (tsc -b && vite build) exits 0"
        status: pass
      - kind: manual_procedural
        ref: "grep -c 'E-Report akan tersedia' frontend/src/pages/EReportPage.tsx -> 0; grep -c 'useReport' -> 2; grep -c 'ExportButtons' -> 3"
        status: pass
    human_judgment: true
    rationale: "Visual layout (sticky export bar, responsive grid, mobile horizontal scroll, amber-400 24pt financial data) and live /api/report fetch behavior require browser UAT; static build + grep confirm wiring only."
  - id: D2
    description: "useReport hook polling GET /api/report every 30s with independent date state"
    requirement: "REPT-01"
    verification:
      - kind: unit
        ref: "frontend/src/hooks/__tests__/useReport.test.ts#Test 1..4 (4 tests pass)"
        status: pass
    human_judgment: false
  - id: D3
    description: "ReportDateFilter with Harian/Mingguan/Bulanan/Custom presets and Bulanan default"
    requirement: "REPT-01"
    verification:
      - kind: manual_procedural
        ref: "grep Harian/Mingguan/Bulanan in ReportDateFilter.tsx all >=1; defaultReportDateRange uses startOfMonth/endOfMonth"
        status: pass
    human_judgment: true
    rationale: "Preset range correctness (timezone-safe date-fns math) and active-preset highlighting on first paint need visual UAT against a live clock; grep confirms presence only."

# Metrics
duration: 2 min
completed: 2026-06-26
status: complete
---

# Phase 3 Plan 02: E-Report Preview UI Summary

**E-Report preview page (/e-report) with independent date filtering (Harian/Mingguan/Bulanan/Custom), summary cards, daily breakdown table, and sticky mobile-responsive export button area — backed by a 30s-polling useReport hook**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-26T09:04:17Z
- **Completed:** 2026-06-26T09:06:30Z
- **Tasks:** 3
- **Files modified:** 8 (7 created, 1 modified)

## Accomplishments
- E-Report preview page replaces the Phase-2 placeholder at `/e-report` and composes the report data flow: `useReport` (poll) → `ReportDateFilter` → `ExportButtons` → `ReportSummaryCards` → `ReportDailyTable`
- `useReport` hook mirrors `useDashboard` (30s poll via `usePolling`, `useCallback` fetcher keyed on date range, manual `refresh()`) but hits `GET /api/report?start=&end=` — 4 behavioral unit tests passing
- `ReportDateFilter` ships Harian/Mingguan/Bulanan presets + a custom manual picker, with `defaultReportDateRange()` returning the current month so the Bulanan preset is active on first paint (D-19/D-20)
- `ReportSummaryCards` shows Total Omset (amber-400 24pt, `formatRupiah`), Hari Tercatat, and top-3 Menu Terlaris with shimmer loading + `-` empty fallback
- `ReportDailyTable` renders the daily breakdown (Tanggal / Omset / Menu Terlaris / Hari Tercatat) in an `overflow-x-auto` container with skeleton rows and a "Tidak ada data untuk periode ini" empty state
- `ExportButtons` is sticky at the top with backdrop-blur, full-width on mobile and right-aligned on desktop, disabled until plans 03-03/03-04 wire PDF/CSV handlers — no component edits needed for wiring

## Task Commits

Each task was committed atomically:

1. **Task 1: report types + useReport hook + ReportDateFilter** - `427b6be` (feat)
2. **Task 2: ReportSummaryCards + ReportDailyTable** - `f1d9074` (feat)
3. **Task 3: ExportButtons + EReportPage preview layout** - `4be206d` (feat)

**Plan metadata:** (committed in final `docs(03-02)` commit below)

## Files Created/Modified
- `frontend/src/types/report.ts` - ReportRow / ReportData / ReportResponse types mirroring backend contract; re-exports DateRange
- `frontend/src/hooks/useReport.ts` - useReport hook polling GET /api/report every 30s with independent date state
- `frontend/src/hooks/__tests__/useReport.test.ts` - 4 behavioral tests mirroring useDashboard.test.ts
- `frontend/src/components/report/ReportDateFilter.tsx` - Harian/Mingguan/Bulanan presets + custom picker; defaultReportDateRange() = current month
- `frontend/src/components/report/ReportSummaryCards.tsx` - 3 summary cards with shimmer loading + empty fallback
- `frontend/src/components/report/ReportDailyTable.tsx` - scrollable daily breakdown table with skeleton + empty states
- `frontend/src/components/report/ExportButtons.tsx` - sticky export bar, mobile full-width, disabled until handlers wired
- `frontend/src/pages/EReportPage.tsx` - full preview page composing all report components with independent date state

## Decisions Made
- **useReport mirrors useDashboard verbatim** — same 30s poll, `useCallback` fetcher keyed on date range, `refresh()` loading flip; only the endpoint path differs. No new abstractions.
- **ReportDateFilter drops dashboard's "Semua" preset and adds "Harian" (today only)** per D-19; "Bulanan" (current month) is the default per D-20, exported via `defaultReportDateRange()` so the preset is highlighted on first paint (same fix as 02-04's `defaultDateRange`).
- **ReportDailyTable uses `overflow-x-auto` for mobile** rather than collapsing columns — preserves all four required columns (Tanggal, Omset, Menu Terlaris, Hari Tercatat) per D-23.
- **ExportButtons handlers are optional props** — buttons disable when a handler is absent OR `data` is null. Plans 03-03/03-04 only need to pass callbacks; the component's layout stays stable.
- **Independent report date state lives in EReportPage** via `useState(defaultReportDateRange())` — not lifted to a shared store, satisfying D-21 (report and dashboard date states must not bleed).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — all three tasks compiled and built on first attempt; all 32 frontend tests (including the 4 new useReport tests) pass; `npm run build` exits 0.

## User Setup Required
None - no external service configuration required. The page consumes the existing `/api/report` endpoint built in 03-01.

## Threat Flags
None new beyond the plan's `<threat_model>`:
- T-03-05 (Information Disclosure): mitigated — `useReport` uses the existing `apiClient` which attaches the Bearer token and handles 401 redirect; no token is logged.
- T-03-06 (Tampering, accept): native date inputs enforce format; backend re-validates with Zod.
- T-03-07 (DoS, accept): 30s polling pauses on tab hidden (D-13, in `usePolling`); same pattern as dashboard.

## Next Phase Readiness
- E-Report preview UI is complete and ready for the export engines (plans 03-03 PDF, 03-04 CSV) — they only need to pass `onExportPDF` / `onExportCSV` handlers to `ExportButtons`.
- The report payload contract (`{ outlet, period, summary: { totalRevenue, dayCount, topItems }, rows }`) is fully typed on the frontend via `frontend/src/types/report.ts`.
- No blockers.

## Self-Check: PASSED
- `frontend/src/types/report.ts` exists: FOUND
- `frontend/src/hooks/useReport.ts` exists: FOUND
- `frontend/src/hooks/__tests__/useReport.test.ts` exists: FOUND
- `frontend/src/components/report/ReportDateFilter.tsx` exists: FOUND
- `frontend/src/components/report/ReportSummaryCards.tsx` exists: FOUND
- `frontend/src/components/report/ReportDailyTable.tsx` exists: FOUND
- `frontend/src/components/report/ExportButtons.tsx` exists: FOUND
- `frontend/src/pages/EReportPage.tsx` (modified, no longer placeholder): FOUND
- commit 427b6be (Task 1) in git log: FOUND
- commit f1d9074 (Task 2) in git log: FOUND
- commit 4be206d (Task 3) in git log: FOUND
- `cd frontend && npm run build` exits 0: PASS
- `npx vitest run` (32 tests, 7 files) all pass: PASS
- `grep -c "E-Report akan tersedia" frontend/src/pages/EReportPage.tsx` returns 0: PASS
- `grep -c "defaultReportDateRange" frontend/src/components/report/ReportDateFilter.tsx` returns >= 1: PASS (2)
- `grep -c "useReport" frontend/src/pages/EReportPage.tsx` returns >= 1: PASS (2)
- `grep -c "ExportButtons" frontend/src/pages/EReportPage.tsx` returns >= 1: PASS (3)
- ReportDateFilter has Harian/Mingguan/Bulanan presets + custom inputs: PASS

---
*Phase: 03-e-report-engine*
*Completed: 2026-06-26*
