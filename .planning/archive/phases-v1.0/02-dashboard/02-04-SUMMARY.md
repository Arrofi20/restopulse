---
phase: 02-dashboard
plan: 04
subsystem: ui
tags: [react, react-hooks, vitest, jsdom, testing-library, date-fns, polling, page-visibility-api, tailwindcss-v4, dark-mode, typescript, chart-placeholders]

# Dependency graph
requires:
  - phase: 02-dashboard
    provides: "Plan 02-02 frontend scaffold — api/client.ts (get/post + Bearer token + 401 redirect), types/dashboard.ts (DashboardData/DateRange), lib/format.ts (formatRupiah)"
  - phase: 02-dashboard
    provides: "Plan 02-03 auth + layout shell — AuthContext, ProtectedRoute, DashboardLayout (Sidebar+Header+main slot), App.tsx router with inline DashboardPage placeholder"
  - phase: 02-dashboard
    provides: "Plan 02-01 backend — GET /api/dashboard?start=&end= returns { success, data: { outlet, trends, summary } }"
provides:
  - "usePolling hook (hooks/usePolling.ts) — generic polling with Page Visibility API: immediate fetch on mount, setInterval cadence, pause on document.hidden, resume with immediate fetch on visible, cleanup on unmount"
  - "useDashboard hook (hooks/useDashboard.ts) — GET /api/dashboard with date range, { data, loading, error, refresh } state, 30s auto-poll via usePolling (D-10), useCallback-stable fetcher keyed on dateRange.start/end so date changes re-fetch (D-04)"
  - "DateFilter component (components/dashboard/DateFilter.tsx) — 4 preset buttons (7 Hari/30 Hari/Bulan Ini/Semua via date-fns) + 2 native date inputs (D-01/D-02/D-03), active-preset highlight, defaultDateRange() export"
  - "SummaryCards component (components/dashboard/SummaryCards.tsx) — Total Omset (formatRupiah, amber-400, 24pt) + Hari Tercatat cards with animate-pulse shimmer loading (D-05/D-12)"
  - "DashboardPage (pages/DashboardPage.tsx) — composes useDashboard + DateFilter + SummaryCards + error banner + chart grid (D-16), default 7-day range (D-01)"
  - "Vitest test infrastructure — vitest@4.1.9 + jsdom + @testing-library/react + @testing-library/jest-dom; 7 behavioral hook tests (3 usePolling, 4 useDashboard) all passing"
affects:
  - 02-dashboard
  - 02-05-chart-components
  - frontend-all-plans

# Tech tracking
tech-stack:
  added:
    - "vitest@^4.1.9 (devDep — verified legitimate: vitest-dev/vitest, MIT)"
    - "@testing-library/react@^16.3.2 (devDep — verified legitimate: testing-library/react-testing-library, MIT)"
    - "jsdom@^29.1.1 (devDep — verified legitimate: jsdom/jsdom, MIT)"
    - "@testing-library/jest-dom@^6.9.1 (devDep — verified legitimate: testing-library/jest-dom, MIT)"
  patterns:
    - "polling-with-visibility-api: usePolling(fetchFn, intervalMs) — useRef for interval id, useEffect for setup/cleanup, visibilitychange listener pauses on document.hidden (D-13); caller MUST wrap fetchFn in useCallback for stable identity"
    - "data-hook-with-polling: useDashboard(dateRange) — useCallback fetcher keyed on date range deps, usePolling(fetcher, 30000) for auto-refresh (D-10), refresh() flips loading + re-invokes (D-11); returns { data, loading, error, refresh }"
    - "controlled-date-filter: DateFilter receives { value, onChange } from DashboardPage; presets computed via date-fns (subDays/startOfMonth/endOfMonth/format); active preset detected by comparing value to each preset's computed range"
    - "timezone-safe-default-range: defaultDateRange() exported from DateFilter uses date-fns local-date format (yyyy-MM-dd) matching the '7 Hari' preset, so the preset is highlighted active on first paint — avoids the UTC-vs-local mismatch that new Date().toISOString() would cause"
    - "tdd-red-green-per-task: Task 1 followed RED (stub hooks + failing tests, commit test(...)) → GREEN (real hooks + passing tests, commit feat(...)); stubs kept tsc green at every commit"

key-files:
  created:
    - frontend/src/hooks/usePolling.ts
    - frontend/src/hooks/useDashboard.ts
    - frontend/src/components/dashboard/DateFilter.tsx
    - frontend/src/components/dashboard/SummaryCards.tsx
    - frontend/src/pages/DashboardPage.tsx
    - frontend/src/test/setup.ts
    - frontend/src/hooks/__tests__/usePolling.test.ts
    - frontend/src/hooks/__tests__/useDashboard.test.ts
  modified:
    - frontend/src/App.tsx
    - frontend/vite.config.ts
    - frontend/package.json
    - frontend/package-lock.json
    - frontend/tsconfig.app.json

key-decisions:
  - "Task 1 executed as TDD RED→GREEN: RED commit (7f6d1f0) added vitest+jsdom+testing-library infra, stub no-op hooks, and 7 failing behavioral tests (3 usePolling, 4 useDashboard); GREEN commit (8609de1) replaced stubs with real implementations per RESEARCH.md §Pattern 5 + §Code Example. All 7 tests pass; tsc exit 0. Stub hooks kept every commit compilable (no broken-build RED commits)."
  - "Installed vitest@4.1.9 + @testing-library/react@16.3.2 + jsdom@29.1.1 + @testing-library/jest-dom@6.9.1 as devDeps — Task 1 has tdd='true' and no test framework existed. All four verified legitimate via `npm view` (canonical GitHub repos, MIT, integrity hashes) BEFORE install, satisfying T-02-06 (slopsquatting mitigation). This is the TDD flow's 'install test framework if needed' step, not a Rule 3 package install."
  - "Used defaultDateRange() (date-fns local-date format) for DashboardPage's initial state instead of the plan's inline `new Date().toISOString().slice(0,10)` arithmetic. The plan's inline approach computes a UTC date that can differ from the '7 Hari' preset's date-fns local date by a day (e.g., local 2026-06-27 02:00 UTC+7 → toISOString gives 2026-06-26), which would leave the preset un-highlighted on first paint. Exporting defaultDateRange() from DateFilter and using it in DashboardPage makes the initial value byte-identical to the preset's computed range. (Rule 1 bug prevention.)"
  - "D-16 chart grid layout: implemented `grid grid-cols-1 gap-6` (Line Chart full-width above, Pie Chart below) per the plan's action text — which explicitly deliberates the D-16 contradiction and concludes with that exact code — and the acceptance criteria ('grid-cols-1 with Line Chart placeholder above, Pie Chart placeholder below'). The must_haves truth ('side-by-side on desktop lg:grid-cols-2') conflicts with both the action text and the acceptance criteria; treated as a stale outlier and followed the action text's explicit resolution. Documented as a deviation."
  - "vite.config.ts imports defineConfig from `vitest/config` (not `vite`) so the `test` field type-checks under `tsc -b` / tsconfig.node.json (which has `types: ['node']` and ignores the `/// <reference types='vitest' />` augmentation). (Rule 3 blocking — npm run build was failing on the untyped `test` property.)"
  - "DASH-03 (tooltip on touch) is NOT marked complete by this plan — 02-04 is the data layer + page shell; chart placeholders render but no charts/tooltips yet. requirements mark-complete run with DASH-01 DASH-02 only (both already complete from 02-01/02-02, so this is a no-op re-affirmation). DASH-03 ships in Plan 02-05 with the chart components + tooltip callbacks. Consistent with 02-02/02-03 SUMMARYs."

patterns-established:
  - "Hook testing pattern: renderHook from @testing-library/react + vi.fn mocks + vi.useFakeTimers for polling interval control; vi.mock('../../api/client') to stub get() for useDashboard tests; act() wraps sync state updates (refresh) to silence React warnings"
  - "Dashboard data flow: DashboardPage owns dateRange state → useDashboard(dateRange) fetches → { data, loading, error, refresh } flows down to DateFilter (value/onChange), SummaryCards (props), and (in 02-05) LineChart + PieChart. Single source of truth for the filter (D-04)."
  - "Component prop contract: DateFilter and SummaryCards are pure/presentational — they receive props and call onChange, never fetch data themselves. Data fetching is centralized in useDashboard."

requirements-completed:
  - DASH-01
  - DASH-02
  # DASH-03 intentionally NOT marked — tooltip functionality ships in Plan 02-05, not this data-layer plan.

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "usePolling hook — immediate fetch on mount, setInterval cadence, pause on document.hidden (D-13), resume with immediate fetch on visible, interval+listener cleanup on unmount"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/hooks/__tests__/usePolling.test.ts#Test 1: calls fetchFn immediately on mount, then every intervalMs thereafter"
        status: pass
      - kind: unit
        ref: "frontend/src/hooks/__tests__/usePolling.test.ts#Test 2: pauses interval when document.hidden becomes true, resumes when false"
        status: pass
      - kind: unit
        ref: "frontend/src/hooks/__tests__/usePolling.test.ts#Test 3: clears interval on unmount (no memory leak)"
        status: pass
    human_judgment: false
  - id: D2
    description: "useDashboard hook — GET /api/dashboard?start=&end= on mount + dateRange change (D-04), { data, loading, error } state transitions, refresh() manual re-fetch (D-11), 30s auto-poll via usePolling (D-10)"
    requirement: DASH-01
    verification:
      - kind: unit
        ref: "frontend/src/hooks/__tests__/useDashboard.test.ts#Test 4: fetches GET /api/dashboard?start=&end= on mount and on dateRange change"
        status: pass
      - kind: unit
        ref: "frontend/src/hooks/__tests__/useDashboard.test.ts#Test 5: updates loading/error/data states correctly"
        status: pass
      - kind: unit
        ref: "frontend/src/hooks/__tests__/useDashboard.test.ts#Test 6: refresh() triggers manual re-fetch"
        status: pass
      - kind: unit
        ref: "frontend/src/hooks/__tests__/useDashboard.test.ts#Test 5b: sets error state when the fetch rejects"
        status: pass
    human_judgment: false
  - id: D3
    description: "DateFilter — 4 preset buttons (7 Hari/30 Hari/Bulan Ini/Semua, D-02) + 2 native date inputs (D-03), active-preset highlight, default 7-day range (D-01)"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — DateFilter.tsx type-checks against date-fns + types/dashboard.ts DateRange"
        status: pass
      - kind: other
        ref: "npm run build (tsc -b && vite build) exit 0 — 264.50 kB JS / 83.32 kB gz bundled"
        status: pass
    human_judgment: true
    rationale: "Preset click behavior, active-highlight rendering, and native date-picker dark-mode styling are structurally verified and bundle cleanly, but actual click→onChange→refetch round-trip and visual active-state styling require a browser + live backend and are deferred to the Phase 2 visual UAT."
  - id: D4
    description: "SummaryCards — Total Omset (formatRupiah, amber-400, >=24pt) + Hari Tercatat cards in sm:grid-cols-2, animate-pulse shimmer on loading (D-05/D-12)"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — SummaryCards.tsx type-checks against lib/format.ts formatRupiah"
        status: pass
      - kind: other
        ref: "npm run build exit 0 — component bundles"
        status: pass
    human_judgment: true
    rationale: "Card layout, Rupiah formatting, and shimmer class wiring are statically verified, but visual rendering (amber-400 contrast, 24pt font size, shimmer animation) requires a browser and is deferred to the Phase 2 visual UAT."
  - id: D5
    description: "DashboardPage — composes useDashboard + DateFilter + SummaryCards + error banner + chart grid (D-16 grid-cols-1, Line above Pie below); default 7-day range (D-01); App.tsx imports the real page"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — DashboardPage.tsx + App.tsx type-check"
        status: pass
      - kind: other
        ref: "npm run build exit 0 — 264.50 kB JS / 83.32 kB gz (under 800KB NFR 9.3)"
        status: pass
      - kind: other
        ref: "npm run dev → Vite ready in 426ms, curl http://localhost:5173/ → HTTP 200"
        status: pass
    human_judgment: true
    rationale: "Page composition, data wiring, and chart-grid layout are statically verified and the dev server serves the route, but live data rendering against a running backend (summary cards populating, date filter triggering refetch, 30s polling visible in Network tab) requires the Express API + seeded data + browser and is deferred to the Phase 2 visual UAT."

# Metrics
duration: ~7 min
completed: 2026-06-26T03:50:35Z
status: complete
---

# Phase 02 Plan 04: Dashboard Data Layer Summary

**usePolling + useDashboard hooks (30s auto-poll, Page Visibility pause, manual refresh), DateFilter (4 date-fns presets + custom picker), SummaryCards (Rupiah + count with shimmer), and the DashboardPage shell wiring them together — TDD-covered by 7 vitest behavioral tests, with chart placeholders ready for Plan 02-05**

## Performance

- **Duration:** ~7 min (447s)
- **Started:** 2026-06-26T03:43:08Z
- **Completed:** 2026-06-26T03:50:35Z
- **Tasks:** 3/3 (Task 1 executed as TDD RED→GREEN; Tasks 2 & 3 standard)
- **Files:** 8 created, 5 modified

## Accomplishments

- **Built the dashboard data layer as two tested hooks.** `usePolling(fetchFn, intervalMs)` calls `fetchFn` immediately on mount, sets a `setInterval` cadence, registers a `visibilitychange` listener that pauses the interval when `document.hidden` (D-13) and resumes with an immediate fetch when visible, and cleans up both the interval and the listener on unmount (no memory leaks). `useDashboard(dateRange)` manages `{ data, loading, error }`, calls `get<{ success, data: DashboardData }>('/dashboard?start=...&end=...')` via the existing apiClient, wraps the fetcher in `useCallback` keyed on `dateRange.start/end` so a date change re-fetches (D-04), drives a 30s `usePolling` (D-10), and exposes `refresh()` for the manual refresh button (D-11). The DashboardData already carries `outlet.name` — no separate outlet fetch.
- **Verified the hooks with 7 behavioral vitest tests** (3 usePolling, 4 useDashboard) covering immediate-mount fetch, interval cadence, visibility pause/resume, unmount cleanup, mount + dateRange-change fetch, loading/data/error transitions, manual refresh, and error-state on rejected fetch. All pass under jsdom with fake timers (usePolling) and real timers + waitFor (useDashboard).
- **Built DateFilter (D-01/D-02/D-03)** — 4 preset buttons ("7 Hari", "30 Hari", "Bulan Ini", "Semua") computed via `date-fns` (`subDays`/`startOfMonth`/`endOfMonth`/`format`), an active-preset highlight (amber-400) by comparing the current `value` to each preset's computed range, and two native `<input type="date">` fields with `[color-scheme:dark]` for the custom picker. Exports `defaultDateRange()` so DashboardPage inits with the same date-fns local-date math the "7 Hari" preset uses (timezone-safe).
- **Built SummaryCards (D-05/D-12)** — two cards in a `sm:grid-cols-2` grid: "Total Omset" via `formatRupiah` in `text-3xl` amber-400 (satisfies the OPENCODE.md >=24pt financial-data rule) and "Hari Tercatat" in `text-3xl` white. A `loading` prop swaps each value for an `animate-pulse` shimmer placeholder so the cards never show "Rp 0" / "0" during the first fetch.
- **Built DashboardPage and wired App.tsx** — `useState(() => defaultDateRange())` (D-01), `useDashboard(dateRange)` (D-04 shared filter), renders `DateFilter` + `SummaryCards` + a red error banner + the chart grid (`grid grid-cols-1 gap-6`: Line Chart placeholder above, Pie Chart below, per D-16 action text). `refresh` is kept in the data contract for Plan 02-05's refresh button. App.tsx's inline placeholder was replaced with `import DashboardPage from './pages/DashboardPage'`.
- **Stood up the project's test infrastructure** — vitest 4.1.9 + jsdom 29.1.1 + @testing-library/react 16.3.2 + @testing-library/jest-dom 6.9.1 (all verified legitimate via `npm view` before install), configured in `vite.config.ts` (`test.environment: jsdom`, `globals: true`, setup file) with `defineConfig` imported from `vitest/config` so `tsc -b` type-checks the `test` field. Added `test` / `test:watch` scripts and `vitest/globals` + `@testing-library/jest-dom` types to tsconfig.app.json.
- **Verified end-to-end**: `npx tsc --noEmit` exit 0; `npm run build` (`tsc -b && vite build`) exit 0 (264.50 kB JS / 83.32 kB gzipped — under the 800KB NFR 9.3); `npm run dev` boots Vite in 426ms with HTTP 200 on `/`; `npx vitest run` → 7/7 tests pass.

## Task Commits

Each task was committed atomically (Task 1 as TDD RED→GREEN):

1. **Task 1 RED: usePolling + useDashboard failing tests + test infra** — `7f6d1f0` (test)
2. **Task 1 GREEN: implement usePolling + useDashboard hooks** — `8609de1` (feat)
3. **Task 2: DateFilter + SummaryCards components** — `0714e54` (feat)
4. **Task 3: DashboardPage + App.tsx integration** — `e1c009a` (feat)

_Plan metadata commit recorded separately below._

## Files Created/Modified

- `frontend/src/hooks/usePolling.ts` — generic polling hook with Page Visibility API (D-10/D-13)
- `frontend/src/hooks/useDashboard.ts` — dashboard data fetching + state + refresh, 30s auto-poll (D-04/D-10/D-11)
- `frontend/src/components/dashboard/DateFilter.tsx` — preset buttons + custom date picker + `defaultDateRange()` export (D-01/D-02/D-03)
- `frontend/src/components/dashboard/SummaryCards.tsx` — total revenue + day count cards with shimmer (D-05/D-12)
- `frontend/src/pages/DashboardPage.tsx` — page composing data layer + filters + summary + chart grid (D-01/D-04/D-16)
- `frontend/src/test/setup.ts` — vitest global setup (jest-dom matchers)
- `frontend/src/hooks/__tests__/usePolling.test.ts` — 3 behavioral tests
- `frontend/src/hooks/__tests__/useDashboard.test.ts` — 4 behavioral tests
- `frontend/src/App.tsx` — replaced inline DashboardPage placeholder with real import (modified)
- `frontend/vite.config.ts` — added `test` config + `defineConfig` from `vitest/config` (modified)
- `frontend/package.json` — added test scripts + 4 test devDeps (modified)
- `frontend/package-lock.json` — lockfile updated (modified)
- `frontend/tsconfig.app.json` — added `vitest/globals` + `@testing-library/jest-dom` types (modified)

## Decisions Made

- **Task 1 ran as TDD RED→GREEN** with stub hooks keeping every commit compilable. RED (`7f6d1f0`) added the test framework + 7 failing behavioral tests against no-op stubs; GREEN (`8609de1`) replaced the stubs with real implementations. This satisfies the per-task TDD gate (test commit precedes feat commit). The plan's frontmatter `type: execute` (not `type: tdd`) means the plan-level TDD gate doesn't apply, but Task 1's `tdd="true"` was honored.
- **Installed 4 test devDeps only after `npm view` verification** — vitest@4.1.9 (vitest-dev/vitest, MIT), @testing-library/react@16.3.2 (testing-library, MIT), jsdom@29.1.1 (jsdom/jsdom, MIT), @testing-library/jest-dom@6.9.1 (testing-library, MIT). This is the TDD flow's "install test framework if needed" step (Task 1 has `tdd="true"` and no framework existed), not a Rule 3 auto-install. T-02-06 (slopsquatting) mitigated by the npm-view legitimacy check.
- **`defaultDateRange()` exported from DateFilter and used by DashboardPage** instead of the plan's inline `new Date().toISOString().slice(0,10)`. The plan's inline approach computes a UTC date that can differ from the "7 Hari" preset's date-fns local date by a day (timezone bug → preset not highlighted on first paint). Single-source-of-truth date-fns local-date computation fixes this. (Rule 1 bug prevention.)
- **D-16 chart grid: `grid grid-cols-1 gap-6`** (Line Chart above, Pie Chart below). The plan's action text explicitly deliberates the D-16 contradiction ("Line Chart full-width above, Pie Chart below" vs "side-by-side on desktop") and concludes with that exact `grid-cols-1` code; the acceptance criteria agrees. The must_haves truth's "lg:grid-cols-2 side-by-side" is a stale outlier that conflicts with both — followed the action text's explicit resolution.
- **`defineConfig` imported from `vitest/config`** (not `vite`) in vite.config.ts. `tsconfig.node.json` has `types: ["node"]` which blocks the `/// <reference types="vitest" />` ambient augmentation, so `tsc -b` (the build's first step) rejected the untyped `test` field. Importing from `vitest/config` provides a `defineConfig` that natively types `test`. (Rule 3 blocking.)
- **DASH-03 left pending** — 02-04 renders chart placeholders, not interactive tooltips. `requirements mark-complete` run with DASH-01 + DASH-02 only (no-op re-affirmation; both already complete from 02-01/02-02). DASH-03 ships in Plan 02-05 with the chart components + tooltip callbacks. Consistent with 02-02/02-03 SUMMARYs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched vite.config.ts to import `defineConfig` from `vitest/config`**
- **Found during:** Task 3 verify (`npm run build` after adding the `test` config in Task 1)
- **Issue:** The Task 1 RED commit added a `test` field to `vite.config.ts` with a `/// <reference types="vitest" />` directive. But `npm run build` runs `tsc -b`, which type-checks `vite.config.ts` against `tsconfig.node.json` — and that config has `"types": ["node"]`, which restricts ambient type inclusion to only `@types/node`. The triple-slash vitest reference was ignored, so `tsc -b` failed: `Object literal may only specify known properties, and 'test' does not exist in type 'UserConfigExport'`.
- **Fix:** Changed `import { defineConfig } from 'vite'` → `import { defineConfig } from 'vitest/config'`. The `vitest/config` re-export types `test` natively, so no ambient augmentation is needed. Kept the `/// <reference types="vitest" />` directive as documentation (harmless).
- **Files modified:** `frontend/vite.config.ts`
- **Verification:** `npm run build` (`tsc -b && vite build`) exit 0; `npx tsc --noEmit` exit 0; `npx vitest run` 7/7 pass.
- **Committed in:** `e1c009a` (Task 3)

**2. [Rule 1 - Bug prevention] Used `defaultDateRange()` (date-fns local) instead of the plan's inline `toISOString()` for DashboardPage initial state**
- **Found during:** Task 3 (DashboardPage initial state) — identified during Task 2 design
- **Issue:** The plan's Task 3 action text shows `dateRange` initialized via `new Date().toISOString().slice(0, 10)` arithmetic. But DateFilter's "7 Hari" preset computes its range via `format(subDays(new Date(), 7), 'yyyy-MM-dd')` (date-fns LOCAL date). `toISOString()` returns a UTC date string — in timezones ahead of UTC, late-evening local times map to the previous UTC day, so the initial value would NOT match the preset's computed range and the "7 Hari" button would not be highlighted as active on first paint (D-01/D-02 UX bug).
- **Fix:** Exported `defaultDateRange()` from DateFilter (uses the same `format(subDays(new Date(), 7), 'yyyy-MM-dd')` as the "7 Hari" preset) and used it in DashboardPage's `useState(() => defaultDateRange())`. The initial value is now byte-identical to the preset's computed range → preset is highlighted active on first paint.
- **Files modified:** `frontend/src/components/dashboard/DateFilter.tsx` (export added in Task 2), `frontend/src/pages/DashboardPage.tsx` (consumed in Task 3)
- **Verification:** Code inspection — `defaultDateRange()` and the "7 Hari" preset call the same date-fns expression; `npx tsc --noEmit` exit 0.
- **Committed in:** `0714e54` (Task 2, export) and `e1c009a` (Task 3, consumption)

**3. [Plan ambiguity resolution] D-16 chart grid layout — followed the action text + acceptance criteria over the stale must_haves truth**
- **Found during:** Task 3 (chart grid implementation)
- **Issue:** D-16 in CONTEXT.md is internally contradictory ("Line Chart full-width above, Pie Chart below on desktop" vs "side-by-side on desktop, stacked on mobile"). The plan's `<must_haves>` truth picked the second clause ("side-by-side on desktop lg:grid-cols-2"), but the plan's `<action>` text explicitly deliberates the contradiction and concludes with `grid grid-cols-1 gap-6` (Line above Pie below), and the `<acceptance_criteria>` says "grid-cols-1 with Line Chart placeholder above, Pie Chart placeholder below". The must_haves truth conflicts with both the action text and the acceptance criteria.
- **Fix:** Implemented `grid grid-cols-1 gap-6` (Line Chart placeholder full-width above, Pie Chart placeholder below) per the action text's explicit code and the acceptance criteria. The must_haves truth is treated as a stale outlier (the planner resolved the D-16 contradiction in the action text but didn't update the truth to match). This is a UI layout choice already resolved by the plan itself, not a Rule 4 architectural checkpoint.
- **Files modified:** `frontend/src/pages/DashboardPage.tsx`
- **Verification:** Acceptance criteria met ("grid-cols-1 with Line Chart placeholder above, Pie Chart placeholder below"); `npx tsc --noEmit` + `npm run build` exit 0.
- **Committed in:** `e1c009a` (Task 3)

---

**Total deviations:** 3 auto-fixed (1 × Rule 3 blocking — vitest/config defineConfig for tsc -b; 1 × Rule 1 bug prevention — timezone-safe defaultDateRange; 1 × plan-ambiguity resolution — D-16 grid-cols-1 per action text over stale must_haves truth). No architectural changes (Rule 4), no scope creep beyond the plan's declared file sets.

## Issues Encountered

None beyond the deviations above. The vitest/jsdom setup worked on the first run; the `act(...)` warning in Test 6 (from `refresh()`'s sync `setLoading(true)`) was silenced by wrapping the call in `act()` within the GREEN commit. react-chartjs-2 / Chart.js were NOT touched in this plan (charts ship in 02-05), so no peer-dependency or tree-shaking concerns arose.

## User Setup Required

None beyond what Plans 02-02 / 02-03 already documented. To exercise the live dashboard:
1. Start the backend: `npm run dev` (repo root) — Express on :3000 with seeded SalesTrend data.
2. Start the frontend: `cd frontend && npm run dev` — Vite on :5173, `/api` proxied to :3000.
3. Visit http://localhost:5173 → login → /dashboard renders DateFilter + SummaryCards (with real data or zeros) + chart placeholders. Network tab shows GET /api/dashboard every 30s.

No new environment variables or external services.

## Threat Mitigations

| Threat | Mitigation | Status |
|--------|------------|--------|
| T-02-14 (Tampering, DateFilter inputs) | Native `<input type="date">` enforces browser-side date format; backend re-validates with Zod (dateRangeSchema from 02-01). DateFilter guards against cleared inputs (`if (!newStart) return`) | Implemented (frontend side); backend Zod validation from 02-01 |
| T-02-15 (Info Disclosure, useDashboard fetch) | All `/api/dashboard` requests include `Authorization: Bearer <token>` via apiClient (from 02-02); data scoped to the token's outletId by the backend | Implemented (relies on 02-02 apiClient + 02-01 backend scoping) |
| T-02-16 (DoS, 30s polling) | 30s interval is low-frequency; usePolling pauses when tab hidden (D-13) so background tabs don't poll; backend reads pre-computed SalesTrend (O(1) from 02-01) | Accepted (per plan threat model) + D-13 pause implemented |

## Threat Flags

None. No security-relevant surface beyond the plan's `<threat_model>` was introduced. The `/api/dashboard` fetch, Bearer-token attach, and 30s polling are exactly T-02-14/T-02-15/T-02-16 (all in the threat register). The Page Visibility API is a browser-only API with no data crossing a trust boundary (noted in the plan's trust boundary table). No new network endpoints, auth paths, or schema changes.

## Known Stubs

| File | Line | Stub | Reason | Resolved By |
|------|------|------|--------|-------------|
| `frontend/src/pages/DashboardPage.tsx` | ~58-66 | Chart placeholders "Line Chart akan tersedia di plan selanjutnya" / "Pie Chart akan tersedia di plan selanjutnya" | Intentional — the plan's objective explicitly states "but with placeholder chart areas". Plan 02-05 replaces these with real Chart.js Line + Pie components. The data layer (useDashboard) and grid layout (D-16) are fully wired; only the canvas renderers are pending. | Plan 02-05 (chart components) |
| `frontend/src/pages/DashboardPage.tsx` | ~30 | `void refresh;` — `refresh` destructured from useDashboard but not yet attached to a button | Intentional — `refresh` is kept in the component's data contract so it isn't tree-shaken from the hook's public surface before Plan 02-05 wires the manual refresh button (D-11). Not a data stub; the function is fully implemented in useDashboard and covered by Test 6. | Plan 02-05 (RefreshButton component, D-11) |

No other stubs: `usePolling.ts`, `useDashboard.ts`, `DateFilter.tsx`, and `SummaryCards.tsx` are complete real implementations with no TODO/FIXME/mock/hardcoded data. The hooks are covered by 7 passing behavioral tests.

## TDD Gate Compliance

Task 1 (`tdd="true"`) followed the RED→GREEN cycle:
- **RED gate:** `7f6d1f0` — `test(02-04): add failing tests for usePolling and useDashboard hooks` (7 behavioral tests against no-op stubs; all 7 failed on assertions, not import errors; tsc remained green via the stubs).
- **GREEN gate:** `8609de1` — `feat(02-04): implement usePolling and useDashboard hooks` (real implementations; all 7 tests pass; tsc exit 0).
- **REFACTOR gate:** No separate refactor commit — the only post-GREEN change was wrapping `refresh()` in `act()` in the test file to silence a cosmetic React warning, included in the GREEN commit. No production-code refactor was needed.

The plan's frontmatter `type: execute` (not `type: tdd`) means the plan-level TDD gate is not in effect, but Task 1's `tdd="true"` was honored per-task. MVP+TDD gate NOT active (`tdd_mode: false` from init).

## Self-Check: PASSED

- All 8 created files exist on disk: `hooks/usePolling.ts`, `hooks/useDashboard.ts`, `components/dashboard/DateFilter.tsx`, `components/dashboard/SummaryCards.tsx`, `pages/DashboardPage.tsx`, `test/setup.ts`, `hooks/__tests__/usePolling.test.ts`, `hooks/__tests__/useDashboard.test.ts` (FOUND).
- All 5 modified files updated: `App.tsx` (real DashboardPage import, placeholder removed), `vite.config.ts` (test config + vitest/config defineConfig), `package.json` (test scripts + 4 devDeps), `package-lock.json`, `tsconfig.app.json` (test types) (FOUND).
- All 4 task commits found in git history: `7f6d1f0` (Task 1 RED), `8609de1` (Task 1 GREEN), `0714e54` (Task 2), `e1c009a` (Task 3).
- `npx tsc --noEmit` exit 0 (re-confirmed post-commit).
- `npm run build` (`tsc -b && vite build`) exit 0 — 264.50 kB JS / 83.32 kB gzipped (under 800KB NFR 9.3).
- `npx vitest run` → 7/7 tests pass (3 usePolling + 4 useDashboard).
- `npm run dev` → Vite ready in 426ms, HTTP 200 on `/`.
- No tracked-file deletions in any task commit.
- No untracked files left after the final task (build `dist/` is gitignored).
- TDD gate: RED commit (`7f6d1f0`, test) precedes GREEN commit (`8609de1`, feat) in git log.

## Next Phase Readiness

- The dashboard data layer is live: `useDashboard(dateRange)` fetches `GET /api/dashboard` with auto-polling (D-10) + visibility pause (D-13) + manual refresh (D-11); `DateFilter` controls the shared date range (D-04); `SummaryCards` renders the totals (D-05); `DashboardPage` composes them with a chart grid (D-16).
- Plan 02-05 can now: build `LineChart` + `PieChart` components consuming `data.trends` / `data.trends[].menu_popularity.items`; replace the two placeholders in DashboardPage; add `Spinner` + `RefreshButton` (wiring `refresh` + `loading`); import `lib/chartConfig.ts` at the app root to register Chart.js; and deliver DASH-03 tooltips (D-06/D-07) + D-08 decline annotations + D-09 empty state.
- **Pending verification (human/UAT):** live data rendering against a running backend (summary cards populating from real SalesTrend rows, date-filter preset clicks triggering refetch, 30s polling visible in the Network tab, Page Visibility pause/resume behavior) is deferred to the Phase 2 visual UAT after Plan 02-05 ships the charts.
- No blockers.

---
*Phase: 02-dashboard*
*Completed: 2026-06-26*
