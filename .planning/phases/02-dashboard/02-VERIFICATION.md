---
phase: 02-dashboard
verified: 2026-06-26T04:16:58Z
status: gaps_found
score: 2/5 must-haves verified
behavior_unverified: 1
overrides_applied: 0
gaps:
  - truth: "Data baru muncul di dasbor dalam waktu ≤3 detik setelah input"
    status: failed
    reason: "Dashboard uses 30-second polling (usePolling(fetchDashboard, 30000) in useDashboard.ts:52). Worst-case delay is 30s, average 15s — 10x the ≤3s requirement. No WebSocket/SSE/real-time push mechanism exists. The 30s interval was a deliberate design decision (D-10) but conflicts with SC-4. CONTEXT.md line 114 mentions SSE as an alternative but it was not implemented. No override documented. No later phase (3/4/5) addresses real-time data refresh."
    artifacts:
      - path: "frontend/src/hooks/useDashboard.ts"
        issue: "Line 52: usePolling(fetchDashboard, 30000) — 30s interval cannot meet ≤3s requirement"
    missing:
      - "Reduce polling interval to ≤3000ms, OR add Server-Sent Events / WebSocket for real-time push, OR document an override if 'input' is reinterpreted as dashboard user interaction (date filter / refresh button) rather than data entry"
behavior_unverified_items:
  - truth: "Tooltip muncul saat titik grafik disentuh, menampilkan nominal dan menu detail"
    test: "Hover/touch a chart point in a browser with live data — verify Chart.js tooltip appears on canvas showing date + Rupiah revenue (Line) and name + percentage + count + revenue (Pie)"
    expected: "Tooltip box renders at the pointer location with the formatted content (D-06 date+Rupiah, D-07 name+%+count+revenue). Works on both hover (desktop) and touch (mobile)."
    why_human: "Tooltip callback content (string formatting) is unit-tested (LineChart.test.tsx Test 3, PieChart.test.tsx Test 2), but the actual on-canvas tooltip appearance at the pointer location is a Chart.js runtime + canvas behavior that jsdom cannot render. No automated test exercises the visual tooltip rendering."
---

# Phase 2: Dashboard Verification Report

**Phase Goal:** Dasbor pemilik dapat diakses dengan visualisasi interaktif tren omset dan menu terlaris, serta update data real-time.
**Verified:** 2026-06-26T04:16:58Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | Dasbor menampilkan Line Chart riwayat omset harian yang runtut dan akurat | ✓ VERIFIED | `LineChart.tsx` renders revenue trend via react-chartjs-2 `Line` on category x-axis with id-ID date labels, decline detection (D-08 red/amber), Rupiah y-axis. Wired: `DashboardPage.tsx:75` → `useDashboard` → `GET /api/dashboard` → `trends` → `LineChart`. Tests: `LineChart.test.tsx` (6 tests pass — decline colors, tooltip formatting, axis format, empty guard). Build: 451.09 kB JS / 147.90 kB gz. |
| 2   | Dasbor menampilkan Pie Chart persentase menu terlaris | ✓ VERIFIED | `PieChart.tsx` aggregates `menu_popularity.items` across trends, groups by name, sums count, accumulates revenue, sorts by count desc, limits to top-10 (D-02). Multi-field tooltip (D-07). Wired: `DashboardPage.tsx:82` → `PieChart`. Tests: `PieChart.test.tsx` (7 tests pass — aggregation, top-10, tooltip lines, empty guard). |
| 3   | Tooltip muncul saat titik grafik disentuh, menampilkan nominal dan menu detail | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Tooltip callbacks implemented: `LineChart.tsx:101-108` (date title + Rupiah label, D-06), `PieChart.tsx:120-134` (name + percentage + count + revenue, D-07). Callback content unit-tested (LineChart Test 3, PieChart Test 2 — both pass). On-canvas tooltip appearance on hover/touch is a Chart.js runtime behavior that jsdom cannot render — needs browser UAT. See Human Verification. |
| 4   | Data baru muncul di dasbor dalam waktu ≤3 detik setelah input | ✗ FAILED | `useDashboard.ts:52`: `usePolling(fetchDashboard, 30000)` — 30-second polling interval. Worst-case delay 30s, average 15s. No WebSocket/SSE/real-time push. Manual refresh button exists but requires user action (not "after input"). 30s >> 3s — requirement structurally unmet. See Gaps Summary. |
| 5   | Halaman dasbor memuat dalam waktu ≤4 detik pada koneksi 4G | ? HUMAN_NEEDED | Bundle: 451.09 kB JS / 147.90 kB gzipped (under 800KB NFR). On 4G (~4-12 Mbps), 147.90 kB gz downloads in ~0.3-1.2s — likely meets ≤4s. No Lighthouse data available. `02-VALIDATION.md` marks as manual-only (Lighthouse audit). See Human Verification. |

**Score:** 2/5 truths verified (1 present, behavior-unverified; 1 failed; 1 human-needed)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/services/DashboardService.ts` | Dashboard data aggregation service | ✓ VERIFIED | 52 lines. Validates date range (dateRangeSchema), queries SalesTrend rows, aggregates summary, JSON.parse menu_popularity, resolves outlet name. No stubs. |
| `src/controllers/DashboardController.ts` | Dashboard request handler with error mapping | ✓ VERIFIED | 50 lines. Singleton DI, extracts outletId from req.user, ZodError→400 VALIDATION_ERROR, else→400 DASHBOARD_ERROR. No stubs. |
| `src/routes/dashboard.routes.ts` | GET /api/dashboard route with authMiddleware | ✓ VERIFIED | 14 lines. Router with authMiddleware + controller handler. Mounted in app.ts:34. |
| `src/app.ts` (modified) | CORS config + dashboard route mount | ✓ VERIFIED | 37 lines. CORS with origin + credentials. Dashboard mounted at /api/dashboard. |
| `src/repositories/SalesTrendRepository.ts` (modified) | aggregateSummary method | ✓ VERIFIED | Lines 69-86. Prisma aggregate with _sum revenue + _count id, null-coalesced to 0. |
| `frontend/src/api/client.ts` | Bearer-token fetch wrapper | ✓ VERIFIED | 74 lines. TOKEN_KEY, Authorization header, 401→clearToken+/login redirect, get/post helpers. No stubs. |
| `frontend/src/types/dashboard.ts` | Dashboard TypeScript contracts | ✓ VERIFIED | 32 lines. DashboardData, SalesTrendItem, MenuPopularityItem, DateRange mirroring backend. |
| `frontend/src/lib/format.ts` | Rupiah formatting utilities | ✓ VERIFIED | 57 lines. formatRupiah via Intl.NumberFormat('id-ID'), formatCompactRupiah with comma decimal (locale fix). Tested. |
| `frontend/src/lib/chartConfig.ts` | Chart.js tree-shaken registration | ✓ VERIFIED | ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler). No chart.js/auto. |
| `frontend/src/contexts/AuthContext.tsx` | Auth context with token + user state | ✓ VERIFIED | login/logout, cross-tab storage sync, isAuthenticated. |
| `frontend/src/pages/LoginPage.tsx` | Login form with Indonesian labels | ✓ VERIFIED | Username/password form, error/loading states, redirect on success. |
| `frontend/src/components/layout/DashboardLayout.tsx` | Layout shell (Sidebar + Header + main) | ✓ VERIFIED | Composes Sidebar + Header + scrollable main slot. |
| `frontend/src/components/layout/Sidebar.tsx` | Responsive sidebar with nav links | ✓ VERIFIED | Dashboard + E-Report NavLinks, mobile hamburger overlay, logout. |
| `frontend/src/components/layout/Header.tsx` | Top bar with hamburger + outlet name + username | ✓ VERIFIED | Hamburger (lg:hidden), outlet name, username, logout. |
| `frontend/src/hooks/usePolling.ts` | Generic polling hook with Page Visibility API | ✓ VERIFIED | 51 lines. Immediate fetch on mount, setInterval, visibility pause, cleanup. Tested (3 tests). |
| `frontend/src/hooks/useDashboard.ts` | Dashboard data fetching with 30s poll | ⚠️ VERIFIED (code) / FAILED (SC-4) | 61 lines. useCallback fetcher, 30s usePolling, refresh(). Code is correct and tested (4 tests), but 30s interval fails SC-4. |
| `frontend/src/components/dashboard/DateFilter.tsx` | Date range selector with presets + custom picker | ✓ VERIFIED | 142 lines. 4 presets (date-fns), active highlight, native date inputs, defaultDateRange() export. |
| `frontend/src/components/dashboard/SummaryCards.tsx` | Total revenue + transaction count cards | ✓ VERIFIED | 56 lines. formatRupiah, text-3xl (24pt), animate-pulse shimmer. |
| `frontend/src/pages/DashboardPage.tsx` | Dashboard page composing all components | ✓ VERIFIED | 88 lines. DateFilter + RefreshButton + SummaryCards + LineChart + PieChart + EmptyState. Fully wired. |
| `frontend/src/components/dashboard/LineChart.tsx` | Line chart with decline detection + Rupiah tooltip | ✓ VERIFIED | 137 lines. computePointColors (D-08), formatLineTooltipLabel (D-06), formatAxisTick. Empty guard. Loading overlay. Tested. |
| `frontend/src/components/dashboard/PieChart.tsx` | Pie chart with top-10 aggregation + multi-field tooltip | ✓ VERIFIED | 148 lines. aggregateMenuItems (D-02 top-10), formatPieTooltipLines (D-07). Empty guard. Loading overlay. Tested. |
| `frontend/src/components/dashboard/EmptyState.tsx` | Empty state message + CTA | ✓ VERIFIED | 37 lines. D-09 Indonesian message, Tambah Data CTA (hidden when no onAddData). Tested. |
| `frontend/src/components/ui/Spinner.tsx` | CSS animate-spin loading indicator | ✓ VERIFIED | CSS-only animate-spin amber-400. Tested. |
| `frontend/src/components/ui/RefreshButton.tsx` | Refresh button with loading state | ✓ VERIFIED | Segarkan + Spinner + Memperbarui... on loading. Tested. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `DashboardPage.tsx` | `useDashboard.ts` | `import { useDashboard } from '../hooks/useDashboard'` + `const { data, loading, error, refresh } = useDashboard(dateRange)` | ✓ WIRED | Line 21, 36. Returns data/loading/error/refresh. |
| `useDashboard.ts` | `api/client.ts` | `import { get } from '../api/client'` + `get<DashboardResponse>('/dashboard?start=...&end=...')` | ✓ WIRED | Line 23, 39. Bearer token attached by client. |
| `api/client.ts` | `GET /api/dashboard` (backend) | `fetch('/api/dashboard?...')` with Authorization header | ✓ WIRED | Vite proxy → Express :3000. 401→clearToken+/login. |
| `dashboard.routes.ts` | `DashboardController.getDashboard` | `router.get('/', authMiddleware, dashboardController.getDashboard.bind(...))` | ✓ WIRED | Route mounted in app.ts:34. |
| `DashboardController` | `DashboardService.getDashboard` | `this.dashboardService.getDashboard(outletId, start, end)` | ✓ WIRED | Line 25. Singleton DI chain. |
| `DashboardService` | `SalesTrendRepository` | `this.salesTrendRepo.findByDateRange(...)` + `aggregateSummary(...)` | ✓ WIRED | Lines 21, 28. Prisma queries. |
| `DashboardPage.tsx` | `LineChart` | `import { LineChart }` + `<LineChart trends={data?.trends ?? []} loading={loading} />` | ✓ WIRED | Line 24, 75. |
| `DashboardPage.tsx` | `PieChart` | `import { PieChart }` + `<PieChart trends={data?.trends ?? []} loading={loading} />` | ✓ WIRED | Line 25, 82. |
| `LineChart.tsx` | `chartConfig.ts` | `import { CHART_COLORS } from '../../lib/chartConfig'` (triggers ChartJS.register side effect) | ✓ WIRED | Line 25. Tree-shaken registration. |
| `LineChart.tsx` | `format.ts` | `import { formatCompactRupiah } from '../../lib/format'` | ✓ WIRED | Line 26. Axis tick formatting. |
| `App.tsx` | `DashboardPage` | `import DashboardPage from './pages/DashboardPage'` + `<ProtectedRoute><DashboardPage /></ProtectedRoute>` | ✓ WIRED | Line 21, 41. Route /dashboard. |
| `App.tsx` | `AuthContext` | `import { useAuth } from './contexts/AuthContext'` + ProtectedRoute guard | ✓ WIRED | Line 18, 25. Navigate to /login if !isAuthenticated. |
| `main.tsx` | `AuthProvider` | `<App />` wrapped in `<AuthProvider>` | ✓ WIRED | Verified in 02-03 SUMMARY. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `LineChart.tsx` | `revenueData` (from `trends`) | `useDashboard` → `GET /api/dashboard` → `SalesTrendRepository.findByDateRange` → Prisma `findMany` | ✓ FLOWING | Prisma query on SalesTrend table, scoped to outlet_id + date range. No hardcoded/empty returns. |
| `PieChart.tsx` | `aggregated` (from `trends[].menu_popularity`) | Same as above — menu_popularity JSON.parse'd in DashboardService | ✓ FLOWING | Real menu data from SalesTrend rows. Aggregation logic tested. |
| `SummaryCards.tsx` | `totalRevenue`, `transactionCount` | `useDashboard` → `summary` from `SalesTrendRepository.aggregateSummary` → Prisma `aggregate` (_sum/_count) | ✓ FLOWING | Prisma aggregate query. Null-coalesced to 0 (not hardcoded). |
| `DashboardPage.tsx` | `data` (DashboardData) | `useDashboard(dateRange)` → `get('/dashboard?...')` | ✓ FLOWING | Full data chain from DB to render. No disconnected props. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Full test suite passes | `cd frontend && npx vitest run` | 28/28 tests pass (6 test files) | ✓ PASS |
| Frontend build succeeds | `cd frontend && npm run build` | tsc -b && vite build exit 0 — 451.09 kB JS / 147.90 kB gz | ✓ PASS |
| Frontend tsc clean | `cd frontend && npx tsc --noEmit` | exit 0 | ✓ PASS |
| Backend tsc clean | `npx tsc --noEmit --skipLibCheck` | exit 0 | ✓ PASS |
| LineChart tooltip formatting | `npx vitest run src/components/__tests__/LineChart.test.tsx -t "tooltip"` | 1 passed (formatLineTooltipLabel returns "Rp 1.234.567") | ✓ PASS |
| PieChart tooltip formatting | Verified via full suite run | formatPieTooltipLines returns [name, "Persentase: x%", "Jumlah: n", "Omset: Rp ..."] | ✓ PASS |
| Decline color computation | Verified via full suite run | computePointColors([100,80,120,110]) → [amber, red, amber, red] | ✓ PASS |
| Top-10 aggregation | Verified via full suite run | aggregateMenuItems limits to 10, sorts by count desc | ✓ PASS |

### Probe Execution

No phase-declared probes (`scripts/*/tests/probe-*.sh`) found. This is a UI/application phase, not a migration/tooling phase. Step 7c: SKIPPED (no probes declared).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| DASH-01 | 02-01, 02-02, 02-04, 02-05 | Line Chart interaktif riwayat tren harian otomatis saat halaman dimuat | ✓ SATISFIED | LineChart wired in DashboardPage, auto-fetches on mount (usePolling immediate fetch), decline detection, Rupiah axis. Tests pass. Marked complete in REQUIREMENTS.md. |
| DASH-02 | 02-01, 02-02, 02-04, 02-05 | Pie Chart persentase menu terlaris otomatis | ✓ SATISFIED | PieChart wired in DashboardPage, top-10 aggregation, percentage calculation. Tests pass. Marked complete in REQUIREMENTS.md. |
| DASH-03 | 02-05 | Tooltip berisi nominal angka omset dan menu terlaris ketika titik tanggal disentuh | ✓ SATISFIED (code) / ⚠️ UAT needed (on-canvas) | Tooltip callbacks implemented + tested for both charts. On-canvas tooltip appearance needs browser UAT. Marked complete in REQUIREMENTS.md. |

**Orphaned requirements:** None. REQUIREMENTS.md maps DASH-01, DASH-02, DASH-03 to Phase 2 — all three covered by plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `frontend/src/pages/EReportPage.tsx` | 1 | "E-Report akan tersedia di Phase 3" placeholder | ℹ️ Info | Intentional Phase 3 placeholder, documented in 02-03 SUMMARY Known Stubs. Not in dashboard path. |
| `frontend/src/pages/DashboardPage.tsx` | 67 | `EmptyState onAddData={() => (window.location.href = '/data-entry')}` — forward-reference to unbuilt Phase 3 route | ℹ️ Info | Documented in 02-05 SUMMARY Known Stubs. Plan explicitly specifies this destination. CTA works (navigates); catch-all redirects back to /dashboard until Phase 3. |

**Debt markers:** No TBD, FIXME, or XXX markers found in `src/` or `frontend/src/` (excluding node_modules and test files). No unreferenced debt markers.

**Stubs in dashboard path:** None. All dashboard components (LineChart, PieChart, SummaryCards, DateFilter, EmptyState, Spinner, RefreshButton, useDashboard, usePolling) are complete real implementations. The only stubs are the documented EReportPage (Phase 3) and the EmptyState CTA forward-reference (Phase 3).

### Human Verification Required

### 1. Tooltip on-canvas appearance (DASH-03 / SC-3)

**Test:** Start backend + frontend. Login → /dashboard. Hover over a Line Chart point (desktop) or tap a point (mobile). Hover over a Pie Chart segment.
**Expected:** Chart.js tooltip box appears at the pointer location. Line: shows date + "Rp <revenue>". Pie: shows name + "Persentase: x%" + "Jumlah: n" + "Omset: Rp ...". Works on both hover and touch.
**Why human:** Tooltip callback content (string formatting) is unit-tested, but the actual on-canvas tooltip rendering at the pointer location is a Chart.js runtime + canvas behavior that jsdom cannot simulate. No automated test exercises the visual tooltip appearance.

### 2. Page load ≤4s on 4G (SC-5)

**Test:** Open Chrome DevTools → Lighthouse → Performance → Throttling: "Slow 4G" → Run on http://localhost:5173/dashboard (with backend running).
**Expected:** Lighthouse performance score with page load ≤4s. Bundle is 147.90 kB gz — on Slow 4G (~1.6 Mbps) this downloads in ~0.7s, so ≤4s is likely met.
**Why human:** Lighthouse audit with network throttling cannot be run in unit tests. The `02-VALIDATION.md` explicitly marks SC-5 as manual-only (Lighthouse audit).

### 3. Live end-to-end dashboard flow

**Test:** Start backend (seeded with SalesTrend data) + frontend. Login → /dashboard. Verify: summary cards populate, Line Chart renders with date labels + decline markers, Pie Chart renders with top-10 segments, date filter preset clicks trigger refetch, 30s polling visible in Network tab, refresh button shows spinner overlay, EmptyState shows for empty date range.
**Expected:** All components render with real data; interactions work as designed.
**Why human:** Full E2E requires running Express + seeded Prisma DB + browser. Unit tests mock the API and Chart.js canvases; visual rendering + interaction timing needs a live environment.

### Gaps Summary

**1. SC-4: Data refresh ≤3s after input — FAILED (BLOCKER)**

The dashboard uses 30-second polling (`usePolling(fetchDashboard, 30000)` in `useDashboard.ts:52`). This means:
- **Worst-case delay:** 30 seconds (data appears on the next poll)
- **Average delay:** 15 seconds
- **Requirement:** ≤3 seconds

The 30s polling interval is 10x the required ≤3s. No WebSocket, SSE, or real-time push mechanism exists. The CONTEXT.md (line 114) mentions SSE as an alternative to polling, but polling was chosen (D-10: "Auto-poll interval: 30 seconds"). No override was documented for this deviation from SC-4.

**Root cause:** Design decision (D-10) conflicts with success criterion (SC-4). The 30s interval was chosen for resource efficiency (D-13 pauses on hidden tabs) but does not satisfy the ≤3s freshness requirement.

**No later phase addresses this:** Phase 3 (E-Report), Phase 4 (QA — includes Lighthouse for SC-5 but not SC-4), and Phase 5 (Deployment) do not mention real-time data refresh.

**Resolution options:**
1. **Reduce polling interval** to ≤3000ms (e.g., `usePolling(fetchDashboard, 2000)`) — simplest fix but increases API load ~15x
2. **Add Server-Sent Events (SSE)** — backend pushes updates to dashboard; CONTEXT.md already identified this as an alternative
3. **Add WebSocket** — bidirectional real-time communication
4. **Document an override** — if "input" in SC-4 is reinterpreted as dashboard user interaction (date filter change / refresh button click) rather than data entry, the current implementation meets ≤3s (immediate re-fetch on filter change + manual refresh). This interpretation should be confirmed with the product owner.

**Recommendation:** Option 4 (clarify interpretation) or Option 1 (reduce to 3s polling) for fastest resolution. Option 2 (SSE) is the architecturally correct long-term solution.

---

_Verified: 2026-06-26T04:16:58Z_
_Verifier: the agent (gsd-verifier)_
