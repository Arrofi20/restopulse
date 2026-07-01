---
phase: 02-dashboard
plan: 05
subsystem: ui
tags: [react, react-chartjs-2, chart.js, typescript, tailwindcss-v4, dark-mode, vitest, jsdom, testing-library, tree-shaking, rupiah-formatting, tooltips]

# Dependency graph
requires:
  - phase: 02-dashboard
    provides: "Plan 02-02 frontend scaffold — api/client.ts (get + Bearer token), types/dashboard.ts (SalesTrendItem/MenuPopularityItem/DashboardData), lib/format.ts (formatRupiah/formatCompactRupiah), lib/chartConfig.ts (ChartJS.register tree-shaken + CHART_COLORS), react-chartjs-2@5.3.1 + chart.js@4.5.1 installed"
  - phase: 02-dashboard
    provides: "Plan 02-03 auth + layout shell — AuthContext, ProtectedRoute, DashboardLayout (Sidebar+Header+main), App.tsx router"
  - phase: 02-dashboard
    provides: "Plan 02-04 data layer — useDashboard(dateRange) -> { data, loading, error, refresh } with 30s usePolling + Page Visibility pause; DateFilter (+ defaultDateRange export), SummaryCards, DashboardPage shell with chart placeholders + `void refresh` forward-reference"
  - phase: 02-dashboard
    provides: "Plan 02-01 backend — GET /api/dashboard?start=&end= returns { success, data: { outlet, trends, summary } } with menu_popularity parsed from JSON"
provides:
  - "LineChart component (components/dashboard/LineChart.tsx) — daily revenue trend (DASH-01) via react-chartjs-2 Line on a category x-axis with id-ID date labels; per-point decline detection (red #ef4444 markers on revenue drops, amber #fbbf24 otherwise, D-08); tooltip shows date + Rupiah revenue (D-06); compact Rupiah y-axis; loading overlay with Spinner (D-12); empty/null guard"
  - "PieChart component (components/dashboard/PieChart.tsx) — menu popularity (DASH-02) aggregating menu_popularity across trends into top-10 by count (D-02); multi-line tooltip shows name + percentage + count + Rupiah revenue (D-07); loading overlay (D-12); empty/null guard"
  - "Spinner (components/ui/Spinner.tsx) — CSS animate-spin amber-400 subtle indicator (D-12)"
  - "RefreshButton (components/ui/RefreshButton.tsx) — Segarkan button wired to refresh+loading; disabled + Spinner + Memperbarui... while loading (D-11/D-12)"
  - "EmptyState (components/dashboard/EmptyState.tsx) — D-09 Indonesian message 'Belum ada data penjualan untuk periode ini' + Tambah Data CTA (hidden when no onAddData)"
  - "DashboardPage (pages/DashboardPage.tsx) — fully wired: top bar (DateFilter + RefreshButton), SummaryCards, error banner, EmptyState when trends empty (D-09), chart grid grid-cols-1 (Line Chart 'Tren Omset Harian' above, Pie Chart 'Menu Terlaris' below, D-16); resolves the 02-04 chart placeholders + `void refresh` forward-reference"
  - "lib/format.ts fix — formatCompactRupiah now uses id-ID comma decimals (Rp 12,0 jt not Rp 12.0 jt) and a regular-space sub-million fallback (was NBSP via currency formatter); formatRupiah untouched"
  - "21 new vitest behavioral tests (6 ui-widgets + 6 LineChart + 7 PieChart + 2 DashboardPage) — react-chartjs-2 mocked to stub canvases; pure logic (computePointColors, aggregateMenuItems, tooltip formatters) tested directly; full suite 28/28 pass"
affects:
  - 02-dashboard
  - 03-e-report
  - 04-qaa
  - frontend-all-plans

# Tech tracking
tech-stack:
  added: []  # react-chartjs-2 + chart.js already installed in 02-02; this plan wires them into components
  patterns:
    - "chart-component-with-pure-helpers: LineChart/PieChart export pure functions (computePointColors, aggregateMenuItems, formatPieTooltipLines, formatLineTooltipLabel, formatAxisTick) alongside the react-chartjs-2 wrapper. The pure functions carry the testable business logic (decline detection, top-10 aggregation, Rupiah/tooltip formatting); the component is a thin wrapper that consumes them. This sidesteps jsdom's lack of canvas support — react-chartjs-2's Line/Pie are mocked to stub <canvas data-testid=.../> in tests while the real logic is unit-tested directly."
    - "chartjs-tree-shaken-registration-via-import-side-effect: chartConfig.ts runs ChartJS.register(...) at module top level. Importing CHART_COLORS from chartConfig.ts triggers that side effect, so chart components need no explicit register call and never import chart.js/auto (RESEARCH.md Pitfall 1). Category x-axis with pre-formatted date labels avoids chartjs-adapter-date-fns (Pitfall 3)."
    - "loading-overlay-not-replacement (D-12): charts render inside a relative h-[300px] container; a loading state paints an absolute inset-0 bg-gray-950/50 + Spinner overlay rather than swapping the chart out, so refreshes don't blank the visualization."
    - "empty-null-guard: chart components coerce undefined/null trends to [] and feed an empty dataset to Chart.js so it renders an empty axis instead of crashing (RESEARCH.md Pitfall 4)."
    - "tdd-red-green-per-task-with-stubs: each of the 3 tasks followed RED (stub components + failing tests, commit test(...)) -> GREEN (real implementation, commit feat(...)); stubs kept tsc green at every RED commit (no broken-build RED commits), matching the 02-04 pattern."

key-files:
  created:
    - frontend/src/components/ui/Spinner.tsx
    - frontend/src/components/ui/RefreshButton.tsx
    - frontend/src/components/dashboard/EmptyState.tsx
    - frontend/src/components/dashboard/LineChart.tsx
    - frontend/src/components/dashboard/PieChart.tsx
    - frontend/src/components/__tests__/ui-widgets.test.tsx
    - frontend/src/components/__tests__/LineChart.test.tsx
    - frontend/src/components/__tests__/PieChart.test.tsx
    - frontend/src/components/__tests__/DashboardPage.test.tsx
  modified:
    - frontend/src/pages/DashboardPage.tsx
    - frontend/src/lib/format.ts

key-decisions:
  - "All 3 tasks executed as TDD RED->GREEN (the plan frontmatter is type: execute, but every task carries tdd=\"true\" with a <behavior> block). 6 commits total: test(...) then feat(...) per task. Stub components in each RED commit kept tsc green so no RED commit broke the build, matching the 02-04 precedent."
  - "Chart testing strategy: react-chartjs-2's Line/Pie are mocked to stub <canvas data-testid=.../> in jsdom (canvas rendering is unsupported in jsdom), and the real business logic (decline color computation, top-10 menu aggregation, Rupiah tooltip + axis formatting) lives in pure exported helpers tested directly. This honors tdd=\"true\" with meaningful coverage without fighting canvas/jsdom flakiness. Resolved the plan's contradictory Task 2 note (\"DO NOT create a separate test file here -- Plan 02-04 can add tests later\") which referenced the already-complete 02-04 plan — a stale copy-paste; the tdd=\"true\" attribute + <behavior> block is the stronger signal and was honored."
  - "Rule 1 fix in lib/format.ts: formatCompactRupiah used .toFixed(1) which emits a dot decimal (\"Rp 12.0 jt\"), locale-incorrect for Indonesian (id-ID uses a comma). Switched to Intl.NumberFormat('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) -> \"Rp 12,0 jt\" matching the plan's acceptance criteria. Also changed the sub-million fallback from formatRupiah (currency formatter emits a non-breaking space U+00A0) to a regular-space `Rp ${Intl.NumberFormat('id-ID').format(amount)}` so the compact function is internally consistent (all regular spaces). formatRupiah (used by SummaryCards) is untouched. formatCompactRupiah had NO prior consumers (charts were placeholders in 02-04), so the change is safe."
  - "Rule 3 fix in LineChart: Chart.js's tooltip context.parsed.y is typed number | null; the original formatLineTooltipLabel(context.parsed.y) failed `tsc -b` (the production build) but passed `npx tsc --noEmit` (the root solution config does not deep-check src under project references). Added a `?? 0` null guard. Switched the per-task verification from `npx tsc --noEmit` to `npm run build` (tsc -b && vite build) which is the stricter, authoritative check and matches the plan's stated intent (\"TypeScript compiles without errors\")."
  - "D-16 chart grid implemented as grid grid-cols-1 gap-6 (Line Chart 'Tren Omset Harian' full-width above, Pie Chart 'Menu Terlaris' below) per the plan's Task 3 action code + acceptance criteria, consistent with the 02-04 resolution of the D-16 contradiction."
  - "EmptyState CTA navigates to '/data-entry' via window.location.href per the plan's exact code. '/data-entry' is a Phase 3 route (FR-009 manual input form) not yet implemented; until Phase 3 the CTA is a forward-reference (documented as a known stub). The plan explicitly specifies this destination."
  - "DASH-03 (tooltip on touch shows nominal + menu detail) is marked COMPLETE by this plan: LineChart tooltip callback renders date + Rupiah revenue (D-06) and PieChart tooltip callback renders name + percentage + count + Rupiah revenue (D-07). The tooltip string formatting is unit-tested; the on-canvas tooltip appearance on hover/touch is a Chart.js runtime behavior deferred to the Phase 2 visual UAT."

patterns-established:
  - "Chart component contract: props { trends: SalesTrendItem[]; loading?: boolean }; coerce trends to [] (empty guard); render react-chartjs-2 component in a relative h-[300px] container; loading paints an absolute overlay + Spinner (never replaces the chart). Pure helpers exported for unit testing."
  - "DashboardPage composition: useDashboard(dateRange) -> top bar (DateFilter + RefreshButton) -> SummaryCards -> error banner -> (EmptyState when !loading && data.trends.length===0) OR (chart grid with section headers in Indonesian). Single source of truth for the filter (D-04) and refresh (D-11)."
  - "Verification discipline: use `npm run build` (tsc -b) not bare `tsc --noEmit` for frontend type verification under the project-references tsconfig layout."

requirements-completed:
  - DASH-01
  - DASH-02
  - DASH-03

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Spinner — CSS animate-spin amber-400 subtle loading indicator (D-12)"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 1: Spinner renders an animated spinning indicator"
        status: pass
    human_judgment: false
  - id: D2
    description: "RefreshButton — Segarkan button calls onClick; loading=true disables + shows Spinner + Memperbarui... (D-11/D-12)"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 2: renders a clickable button that calls onClick handler"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 3: shows spinning state when loading prop is true"
        status: pass
    human_judgment: false
  - id: D3
    description: "EmptyState — D-09 Indonesian message 'Belum ada data penjualan untuk periode ini' + Tambah Data CTA (hidden when no onAddData); CTA calls onClick"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 4: renders the Indonesian message and CTA button"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 4b: hides the CTA button when onAddData is not provided"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/ui-widgets.test.tsx#Test 5: CTA button is clickable and calls onClick handler"
        status: pass
    human_judgment: false
  - id: D4
    description: "LineChart — daily revenue trend (DASH-01) with id-ID date x-axis labels, per-point decline detection (red markers on drops, amber otherwise, D-08), Rupiah tooltip (D-06), compact Rupiah y-axis, loading overlay (D-12), empty/no-crash guard"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/LineChart.test.tsx#Test 2: red for decline, amber otherwise (computePointColors, D-08)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/LineChart.test.tsx#Test 3: tooltip label formats revenue as Rupiah (D-06)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/LineChart.test.tsx#Test 4: axis tick uses compact Rupiah format"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/LineChart.test.tsx#Test 1 + Test 5: renders stub canvas; empty/undefined trends no crash"
        status: pass
      - kind: other
        ref: "npm run build (tsc -b && vite build) exit 0 — 451.09 kB JS / 147.90 kB gz (under 800KB NFR 9.3)"
        status: pass
    human_judgment: true
    rationale: "Decline-color computation, Rupiah tooltip/axis formatting, and no-crash guards are unit-proven, but actual canvas rendering (line drawing, red point pixels, on-hover tooltip appearance, dark-theme colors) requires a browser + live backend and is deferred to the Phase 2 visual UAT."
  - id: D5
    description: "PieChart — menu popularity (DASH-02) aggregating menu_popularity into top-10 by count (D-02); multi-line tooltip shows name + percentage + count + Rupiah revenue (D-07); loading overlay (D-12); empty/no-crash guard"
    requirement: DASH-02
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/PieChart.test.tsx#Test 3: aggregates across trends, sorts by count desc, limits to 10 (D-02)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/PieChart.test.tsx#Test 2: tooltip shows name, percentage, count, and revenue (D-07)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/PieChart.test.tsx#Test 1 + Test 4: renders stub canvas; empty/undefined trends no crash"
        status: pass
      - kind: other
        ref: "npm run build (tsc -b && vite build) exit 0"
        status: pass
    human_judgment: true
    rationale: "Top-10 aggregation, multi-field tooltip formatting, and no-crash guards are unit-proven, but actual pie segment rendering, legend layout, and on-hover tooltip appearance require a browser + live backend and are deferred to the Phase 2 visual UAT."
  - id: D6
    description: "DashboardPage — fully wired: top bar (DateFilter + RefreshButton on refresh+loading, D-11), SummaryCards, error banner, EmptyState when trends empty and not loading (D-09), chart grid grid-cols-1 with 'Tren Omset Harian' + 'Menu Terlaris' headers (D-16)"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/DashboardPage.test.tsx#Test 5: renders EmptyState when trends array is empty and not loading (D-09)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/DashboardPage.test.tsx#renders Line + Pie charts when trends exist (not the empty state)"
        status: pass
      - kind: other
        ref: "npm run build (tsc -b && vite build) exit 0"
        status: pass
    human_judgment: true
    rationale: "Empty-state branching and chart-presence routing are unit-proven, but the live end-to-end flow (date-filter preset click -> refetch -> charts update, 30s polling visible in Network tab, refresh spinner overlay, manual refresh) requires a browser + live backend and is deferred to the Phase 2 visual UAT."
  - id: D7
    description: "DASH-03 — tooltips appear at the chart touch point showing nominal (Line: date + Rupiah revenue, D-06) and menu detail (Pie: name + percentage + count + Rupiah revenue, D-07)"
    requirement: DASH-03
    verification:
      - kind: unit
        ref: "frontend/src/components/__tests__/LineChart.test.tsx#Test 3: tooltip label formats revenue as Rupiah (D-06)"
        status: pass
      - kind: unit
        ref: "frontend/src/components/__tests__/PieChart.test.tsx#Test 2: tooltip shows name, percentage, count, and revenue (D-07)"
        status: pass
      - kind: other
        ref: "npm run build exit 0 — tooltip callbacks wired into ChartOptions.plugins.tooltip.callbacks for both charts"
        status: pass
    human_judgment: true
    rationale: "Tooltip content (the strings rendered) is unit-proven via the callback formatters, but the actual on-canvas tooltip appearance on hover/touch at the pointer location is a Chart.js runtime + canvas behavior that requires a browser to verify (the plan's <verification> section lists hover/touch checks as manual steps). Deferred to the Phase 2 visual UAT."

# Metrics
duration: ~10 min
completed: 2026-06-26T04:06:49Z
status: complete
---

# Phase 02 Plan 05: Chart Components + UI Widgets Summary

**Interactive Chart.js Line + Pie charts with per-point decline detection (D-08), Rupiah + multi-field tooltips (DASH-03/D-06/D-07), EmptyState (D-09), Spinner + manual RefreshButton (D-11/D-12) — all wired into the DashboardPage, TDD-covered by 21 new behavioral tests (28/28 suite pass)**

## Performance

- **Duration:** ~10 min (600s)
- **Started:** 2026-06-26T03:56:54Z
- **Completed:** 2026-06-26T04:06:49Z
- **Tasks:** 3/3 (all executed as TDD RED→GREEN)
- **Files:** 9 created, 2 modified

## Accomplishments

- **Built the LineChart (DASH-01/D-06/D-08).** Renders the daily revenue trend via react-chartjs-2 `Line` on a `category` x-axis with id-ID date labels (no chartjs-adapter-date-fns — RESEARCH.md Pitfall 3). `computePointColors` marks each point red `#ef4444` when `revenueData[i] < revenueData[i-1]` and amber `#fbbf24` otherwise (D-08), with the first point amber. The tooltip callback shows the date as the title and `Rp <revenue>` as the label (D-06); the y-axis ticks use `formatCompactRupiah` (e.g. "Rp 12,3 jt"). A loading state paints a semi-transparent overlay + Spinner over the chart (D-12) rather than replacing it, and undefined/empty trends render an empty dataset so Chart.js never crashes (Pitfall 4).
- **Built the PieChart (DASH-02/D-07/D-02).** Aggregates `menu_popularity.items` across all trend rows: groups by name, sums `count`, and accumulates `revenue` contributed per item as `(percentage / 100) * trend.revenue` per row; sorts by count desc and takes the top 10 (D-02). The tooltip callback renders four lines — name, `Persentase: x%`, `Jumlah: n`, `Omset: Rp ...` (D-07) — and the legend sits on the right with dark-theme label colors. Same loading overlay + empty-guard pattern as LineChart.
- **Built the supporting UI widgets.** `Spinner` is a CSS-only `animate-spin` amber-400 circle (w-4 h-4) — subtle per D-12. `RefreshButton` renders "🔄 Segarkan" and, when `loading` is true, disables itself and swaps to `<Spinner />` + "Memperbarui..." (D-11/D-12). `EmptyState` renders the exact D-09 Indonesian message ("Belum ada data penjualan untuk periode ini") plus a sub-message and an amber-500 "Tambah Data" CTA that is hidden when no `onAddData` handler is supplied.
- **Wired the full DashboardPage.** Replaced the 02-04 chart placeholders with real `LineChart` ("Tren Omset Harian") and `PieChart` ("Menu Terlaris") in a `grid grid-cols-1 gap-6` (D-16). Added a top bar with `DateFilter` + `RefreshButton` (wired to `useDashboard`'s `refresh` + `loading`, resolving the 02-04 `void refresh` forward-reference). When `!loading && data.trends.length === 0` the page shows `EmptyState` instead of the charts (D-09). The Header (outlet name, D-17) remains in DashboardLayout.
- **Fixed a locale bug in `formatCompactRupiah`.** The original `.toFixed(1)` emitted a dot decimal ("Rp 12.0 jt") — wrong for Indonesian (id-ID uses a comma). Switched to `Intl.NumberFormat('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1})` so it produces "Rp 12,0 jt" matching the plan's acceptance criteria. Also made the sub-million fallback use a regular space (the currency formatter emits a non-breaking space) for internal consistency. `formatRupiah` (SummaryCards) is untouched; `formatCompactRupiah` had no prior consumers.
- **Verified end-to-end.** `npm run build` (`tsc -b && vite build`) exit 0 — 451.09 kB JS / 147.90 kB gzipped (under the 800KB NFR 9.3; the ~187 kB increase over 02-04's 264 kB is Chart.js now actually bundled via the chart components importing `chartConfig.ts`). `npx vitest run` → 28/28 tests pass (21 new + 7 from 02-04). No tracked-file deletions in any commit; no untracked files left (`dist/` is gitignored).

## Task Commits

Each task was committed atomically as TDD RED→GREEN (test commit precedes feat commit):

1. **Task 1 RED: failing tests for Spinner/RefreshButton/EmptyState + stubs** — `42fc33a` (test)
2. **Task 1 GREEN: implement Spinner, RefreshButton, EmptyState** — `917d7b2` (feat)
3. **Task 2 RED: failing tests for LineChart + stubs** — `6562c6a` (test)
4. **Task 2 GREEN: implement LineChart + format.ts compact-Rupiah fix** — `1c0109b` (feat)
5. **Task 3 RED: failing tests for PieChart + DashboardPage integration + stubs** — `45452a0` (test)
6. **Task 3 GREEN: implement PieChart + wire DashboardPage + LineChart null-guard** — `59cd029` (feat)

_Plan metadata commit recorded separately below._

## Files Created/Modified

- `frontend/src/components/ui/Spinner.tsx` — CSS animate-spin amber-400 subtle indicator (D-12)
- `frontend/src/components/ui/RefreshButton.tsx` — Segarkan button + loading state (D-11/D-12)
- `frontend/src/components/dashboard/EmptyState.tsx` — D-09 empty-state message + Tambah Data CTA
- `frontend/src/components/dashboard/LineChart.tsx` — revenue trend + decline detection + Rupiah tooltip (DASH-01/D-06/D-08) + exported pure helpers
- `frontend/src/components/dashboard/PieChart.tsx` — menu popularity top-10 + multi-field tooltip (DASH-02/D-07) + exported pure helpers
- `frontend/src/components/__tests__/ui-widgets.test.tsx` — 6 tests (Spinner/RefreshButton/EmptyState)
- `frontend/src/components/__tests__/LineChart.test.tsx` — 6 tests (decline colors, tooltip, axis, render/no-crash)
- `frontend/src/components/__tests__/PieChart.test.tsx` — 7 tests (aggregation, tooltip, top-10, render/no-crash)
- `frontend/src/components/__tests__/DashboardPage.test.tsx` — 2 tests (EmptyState when empty, charts when populated)
- `frontend/src/pages/DashboardPage.tsx` — fully wired dashboard (modified: placeholders replaced, RefreshButton + EmptyState added)
- `frontend/src/lib/format.ts` — `formatCompactRupiah` locale fix (modified: comma decimals + regular-space fallback)

## Decisions Made

- **All 3 tasks ran as TDD RED→GREEN.** The plan frontmatter is `type: execute` (so the plan-level TDD gate is not in force), but every task carries `tdd="true"` with a `<behavior>` block — the per-task TDD signal was honored. 6 commits: `test(...)` RED (stub components + failing tests, tsc green via stubs) then `feat(...)` GREEN per task. This matches the 02-04 precedent and satisfies the per-task TDD gate (test commit precedes feat commit).
- **Chart testing strategy = mock react-chartjs-2 + test pure helpers.** jsdom cannot render Chart.js canvases, so `Line`/`Pie` are mocked to stub `<canvas data-testid=.../>` elements. The real business logic — `computePointColors` (D-08), `aggregateMenuItems` (D-02), `formatLineTooltipLabel`/`formatPieTooltipLines`/`formatAxisTick` — lives in pure exported functions unit-tested directly. This gave meaningful coverage (21 tests) without canvas/jsdom flakiness. Resolved the plan's contradictory Task 2 note ("DO NOT create a separate test file here — Plan 02-04 can add tests later") which referenced the already-complete 02-04 plan (stale copy-paste); the `tdd="true"` attribute is the stronger signal.
- **`formatCompactRupiah` locale fix (Rule 1).** `.toFixed(1)` produced "Rp 12.0 jt" (dot) — locale-incorrect for id-ID (comma). Switched to `Intl.NumberFormat('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1})` → "Rp 12,0 jt". Sub-million fallback switched from `formatRupiah` (NBSP via currency formatter) to a regular-space `Rp ${Intl.NumberFormat('id-ID').format(amount)}` for internal consistency. `formatRupiah` untouched. No prior consumers of `formatCompactRupiah` (charts were placeholders), so the change is safe.
- **`tsc -b` is the authoritative type check, not bare `tsc --noEmit`.** The LineChart tooltip's `context.parsed.y` is `number | null`; the original call passed `tsc --noEmit` (root solution config doesn't deep-check src under project references) but failed `tsc -b` (the production build). Added a `?? 0` null guard (Rule 3) and switched per-task verification to `npm run build` (`tsc -b && vite build`).
- **D-16 grid-cols-1** (Line Chart above, Pie Chart below) per the plan's Task 3 action code + acceptance criteria, consistent with the 02-04 resolution.
- **EmptyState CTA → `/data-entry`** (Phase 3 route, FR-009) per the plan's exact code — a forward-reference until Phase 3 builds the manual input form (documented as a known stub).
- **DASH-03 marked complete** — tooltip callbacks (D-06 date+revenue, D-07 name+%+count+revenue) are implemented and unit-tested; on-canvas tooltip appearance on hover/touch is deferred to the visual UAT.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `formatCompactRupiah` produced locale-incorrect decimal separator**
- **Found during:** Task 2 (LineChart y-axis uses `formatCompactRupiah`)
- **Issue:** `formatCompactRupiah` used `.toFixed(1)` which always emits a dot decimal — "Rp 12.0 jt" — wrong for the Indonesian locale (id-ID uses a comma). The plan's acceptance criteria explicitly show "Rp 12,3 jt" (comma). The sub-million fallback also delegated to `formatRupiah`, whose currency formatter emits a non-breaking space (U+00A0) between "Rp" and the amount, making the compact function internally inconsistent (regular space for jt/M, NBSP for the fallback).
- **Fix:** Switched both compact branches to `Intl.NumberFormat('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1})` (→ "Rp 12,0 jt"), and changed the sub-million fallback to `Rp ${new Intl.NumberFormat('id-ID').format(amount)}` (regular space, consistent with the compact branches). `formatRupiah` (used by SummaryCards) is untouched.
- **Files modified:** `frontend/src/lib/format.ts`
- **Verification:** `node` check confirms `formatCompactRupiah(12_000_000)` = "Rp 12,0 jt", `(1_500_000_000)` = "Rp 1,5 M", `(500_000)` = "Rp 500.000"; `LineChart.test.tsx` Test 4 passes; `npm run build` exit 0; full vitest suite 28/28.
- **Committed in:** `1c0109b` (Task 2 GREEN)

**2. [Rule 3 - Blocking] LineChart tooltip `context.parsed.y` is `number | null`**
- **Found during:** Task 3 verify (`npm run build` after the LineChart GREEN had passed `tsc --noEmit`)
- **Issue:** Chart.js types `TooltipItem<'line'>.parsed.y` as `number | null`. `formatLineTooltipLabel(context.parsed.y)` failed `tsc -b` (`TS2345: Argument of type 'number | null' is not assignable to parameter of type 'number'`) but passed `npx tsc --noEmit` (the root solution config does not deep-check `src` under the project-references layout). The plan's stated verify is `npx tsc --noEmit`, but the acceptance criteria ("TypeScript compiles without errors") is really satisfied only by `tsc -b`.
- **Fix:** Added a null guard — `formatLineTooltipLabel(context.parsed.y ?? 0)`. Switched the per-task verification command from `npx tsc --noEmit` to `npm run build` (`tsc -b && vite build`) for all remaining checks, since `tsc -b` is the stricter, authoritative type check under this tsconfig layout.
- **Files modified:** `frontend/src/components/dashboard/LineChart.tsx`
- **Verification:** `npm run build` exit 0; vitest suite 28/28.
- **Committed in:** `59cd029` (Task 3 GREEN)

**3. [Plan contradiction resolution] Honored `tdd="true"` over the stale "DO NOT create a separate test file" note**
- **Found during:** Task 2 (reading the Task 2 `<action>`)
- **Issue:** Task 2's action text says "DO NOT create a separate test file here — Plan 02-04 can add tests later as part of validation phase." But the task carries `tdd="true"` with a `<behavior>` block of 5 tests, and Plan 02-04 is the PRIOR, already-complete plan (not a future one) — the note is a stale copy-paste. The two signals contradict.
- **Fix:** Honored the `tdd="true"` attribute + `<behavior>` block (the stronger, structured signal) and wrote tests for all 3 tasks. For chart components, used the mock-react-chartjs-2 + pure-helper strategy to keep tests meaningful and jsdom-safe. Documented as a deviation for transparency.
- **Files modified:** none beyond the planned test files
- **Verification:** 21 new tests pass; full suite 28/28.
- **Committed in:** across all 3 RED commits (`6562c6a` etc.)

---

**Total deviations:** 3 (1 × Rule 1 bug — compact Rupiah locale; 1 × Rule 3 blocking — tooltip null guard + verify-command upgrade; 1 × plan-contradiction resolution — honored tdd="true"). No architectural changes (Rule 4), no scope creep beyond the plan's declared file sets (the `format.ts` touch is a Rule 1 bug fix surfaced by the task's axis formatting).

## Issues Encountered

None beyond the deviations above. The `tsc --noEmit` vs `tsc -b` discrepancy (deviation #2) was the only surprise — `tsc --noEmit` on the root solution config passed while `tsc -b` (the build) caught a stricter error. Resolved by fixing the null guard and adopting `npm run build` as the authoritative verify. react-chartjs-2 / Chart.js tree-shaken registration worked on the first try (chartConfig.ts side-effect import); no peer-dependency or canvas-adapter issues (category x-axis, no time scale).

## User Setup Required

None beyond what Plans 02-02 / 02-03 / 02-04 already documented. To exercise the live dashboard:
1. Start the backend: `npm run dev` (repo root) — Express on :3000 with seeded SalesTrend data.
2. Start the frontend: `cd frontend && npm run dev` — Vite on :5173, `/api` proxied to :3000.
3. Visit http://localhost:5173 → login → /dashboard renders DateFilter + RefreshButton + SummaryCards + Line Chart + Pie Chart (or EmptyState if no data). Hover chart points → tooltips. Click "Segarkan" → spinner overlay + refresh. Network tab shows GET /api/dashboard every 30s.

No new environment variables or external services.

## Threat Mitigations

| Threat | Mitigation | Status |
|--------|------------|--------|
| T-02-17 (Info Disclosure, chart tooltip content) | Revenue data in tooltips is intentional dashboard behavior; authenticated access controls visibility. Tooltip callbacks render only data already in the authenticated `trends` payload — no extra fetch. | Accepted (per plan threat model) + implemented (callbacks read only passed data) |
| T-02-18 (Tampering, PieChart menu data) | Data sourced from authenticated `/api/dashboard`; no user-modifiable chart data on the client. Aggregation is read-only over API data. | Accepted (per plan threat model) |
| T-02-19 (DoS, Chart.js rendering) | Client-side rendering only; top-10 limit (D-02) caps Pie segments; Line Chart bounded by the date range. | Accepted (per plan threat model) + D-02 top-10 enforced in `aggregateMenuItems` |
| T-02-20 (Elevation of Privilege, RefreshButton) | Refresh triggers the same authenticated `GET /api/dashboard` call as auto-poll; no privilege path. | Accepted (per plan threat model) + RefreshButton wired to existing `refresh` |

## Threat Flags

None. No security-relevant surface beyond the plan's `<threat_model>` was introduced. Chart components render authenticated API data on a canvas (no DOM injection); tooltips read only data already in the authenticated payload; RefreshButton reuses the existing authenticated fetch. No new network endpoints, auth paths, file access, or schema changes.

## Known Stubs

| File | Line | Stub | Reason | Resolved By |
|------|------|------|--------|-------------|
| `frontend/src/pages/DashboardPage.tsx` | ~80 | `EmptyState onAddData={() => (window.location.href = '/data-entry')}` | Intentional forward-reference per the plan's exact code. `/data-entry` is a Phase 3 route (FR-009 manual input form) not yet implemented; until Phase 3 the CTA navigates to a route the router's catch-all redirects back to `/dashboard`. The plan explicitly specifies this destination. | Phase 3 (Owner Dashboard & E-Report — manual input form) |

**Resolved stubs from prior plans:**
- `frontend/src/pages/DashboardPage.tsx` chart placeholders ("Line Chart akan tersedia di plan selanjutnya" / "Pie Chart akan tersedia di plan selanjutnya") — **RESOLVED** by this plan (real `LineChart` + `PieChart` wired in).
- `frontend/src/pages/DashboardPage.tsx` `void refresh;` forward-reference — **RESOLVED** by this plan (`refresh` wired to `RefreshButton` onClick, D-11).

No other stubs: `LineChart.tsx`, `PieChart.tsx`, `Spinner.tsx`, `RefreshButton.tsx`, `EmptyState.tsx`, and the `format.ts` fix are complete real implementations with no TODO/FIXME/mock/hardcoded data. The chart logic is covered by 21 passing behavioral tests.

## TDD Gate Compliance

All 3 tasks (`tdd="true"`) followed the RED→GREEN cycle:
- **Task 1 RED:** `42fc33a` — `test(02-05): add failing tests for Spinner, RefreshButton, EmptyState` (6 behavioral tests against no-op stubs; tsc green via stubs; tests failed on assertions/missing elements).
- **Task 1 GREEN:** `917d7b2` — `feat(02-05): implement Spinner, RefreshButton, EmptyState UI components` (real implementations; 6/6 tests pass; tsc exit 0).
- **Task 2 RED:** `6562c6a` — `test(02-05): add failing tests for LineChart decline detection + tooltips` (6 tests against stub helpers; tsc green; meaningful tests failed).
- **Task 2 GREEN:** `1c0109b` — `feat(02-05): implement LineChart with decline detection + Rupiah tooltips` (real implementation + format.ts fix; 6/6 tests pass).
- **Task 3 RED:** `45452a0` — `test(02-05): add failing tests for PieChart + DashboardPage integration` (9 tests against stub PieChart + current DashboardPage; tsc green; meaningful tests failed).
- **Task 3 GREEN:** `59cd029` — `feat(02-05): implement PieChart + wire all components into DashboardPage` (real PieChart + DashboardPage wiring + LineChart null-guard; 9/9 tests pass; build exit 0).

No REFACTOR commits were needed — the implementations were clean on first GREEN. The plan's frontmatter `type: execute` (not `type: tdd`) means the plan-level TDD gate is not in effect, but every task's `tdd="true"` was honored per-task. MVP+TDD gate NOT active (tdd_mode: false from init).

## Self-Check: PASSED

- All 9 created files exist on disk: `components/ui/Spinner.tsx`, `components/ui/RefreshButton.tsx`, `components/dashboard/EmptyState.tsx`, `components/dashboard/LineChart.tsx`, `components/dashboard/PieChart.tsx`, `components/__tests__/ui-widgets.test.tsx`, `components/__tests__/LineChart.test.tsx`, `components/__tests__/PieChart.test.tsx`, `components/__tests__/DashboardPage.test.tsx` (FOUND).
- Both modified files updated: `pages/DashboardPage.tsx` (placeholders replaced, RefreshButton + EmptyState wired), `lib/format.ts` (compact Rupiah locale fix) (FOUND).
- All 6 task commits found in git history in correct TDD order: `42fc33a` (T1 RED) → `917d7b2` (T1 GREEN) → `6562c6a` (T2 RED) → `1c0109b` (T2 GREEN) → `45452a0` (T3 RED) → `59cd029` (T3 GREEN).
- `npm run build` (`tsc -b && vite build`) exit 0 — 451.09 kB JS / 147.90 kB gzipped (under 800KB NFR 9.3).
- `npx vitest run` → 28/28 tests pass (21 new this plan + 7 from 02-04).
- No tracked-file deletions in any of the 6 task commits.
- No untracked files left after the final task (`dist/` is gitignored).
- TDD gate: every task has a `test(...)` RED commit preceding its `feat(...)` GREEN commit in git log.

## Next Phase Readiness

- **Phase 02 dashboard is functionally complete.** All three requirements ship: DASH-01 (Line Chart revenue trend with date labels + Rupiah axis), DASH-02 (Pie Chart top-10 menu popularity), DASH-03 (tooltips showing nominal + menu detail at the touch point). Supporting decisions D-06/D-07/D-08/D-09/D-11/D-12 are implemented; D-10 (30s auto-poll) + D-13 (visibility pause) shipped in 02-04 and are exercised through the wired DashboardPage.
- **Pending verification (human/UAT):** the Phase 2 visual UAT should confirm against a running backend — live chart rendering (line/pie pixels, red decline markers, dark-theme colors), tooltip appearance on hover/touch, date-filter preset clicks triggering refetch + chart updates, 30s polling in the Network tab, the refresh spinner overlay, and the EmptyState CTA flow. All logic is unit-proven; only canvas/visual runtime behavior needs a browser.
- **Phase 3 (Owner Dashboard & E-Report) can:** implement the `/data-entry` route that the EmptyState CTA points to (FR-009 manual input form), the E-Report engine + PDF/CSV export, and the owner admin injector UI. The dashboard data layer (`useDashboard`), chart components, and layout shell are ready to compose against.
- No blockers.

---
*Phase: 02-dashboard*
*Completed: 2026-06-26*
