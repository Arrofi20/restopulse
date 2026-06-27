---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 05
current_phase_name: deployment-demo
status: executing
stopped_at: Completed 05-01-PLAN.md
last_updated: "2026-06-27T10:52:55.102Z"
last_activity: 2026-06-27
last_activity_desc: Phase 05 execution started
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 23
  completed_plans: 21
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-25)

**Core value:** Pemilik restoran dapat langsung melihat tren pendapatan harian dan menu paling laku, serta menghasilkan laporan keuangan akurat dalam hitungan detik — tanpa perlu menghabiskan berjam-jam untuk rekapitulasi buku kas atau nota fisik.
**Current focus:** Phase 05 — deployment-demo

## Current Position

Phase: 05 (deployment-demo) — EXECUTING
Plan: 2 of 4
Status: Ready to execute
Last activity: 2026-06-27 — Phase 05 execution started

Progress: [██████████] 100% (10/10 plans; 2/5 phases)

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: ~15 min/plan
- Total execution time: ~1.3 hours

**By Phase:**

| Phase | Plans Completed | Duration |
|-------|-----------------|----------|
| 1     | 5/5             | ~1.3h    |
| Phase 02 P01 | 10min | 3 tasks | 5 files |
| Phase 02 P02 | ~5 min | 3 tasks | 17 files |
| Phase 02 P03 | 4min | 3 tasks | 8 files |
| Phase 02 P04 | 7min | 3 tasks | 13 files |
| Phase 02 P05 | 10min | 3 tasks | 11 files |
| Phase 03 P01 | 3 min | 3 tasks | 6 files |
| Phase 03 P02 | 2min | 3 tasks | 8 files |
| Phase 03 P03 | 6 min | 2 tasks | 5 files |
| Phase 03 P04 | 1 min | 2 tasks | 2 files |
| Phase 04-quality-assurance P01 | 15min | 2 tasks | 7 files |
| Phase 04-quality-assurance P03 | 6min | 3 tasks | 10 files |
| Phase 04-quality-assurance P04 | 25min | 2 tasks | 2 files |
| Phase 04-quality-assurance P05 | 3min | 3 tasks | 4 files |
| Phase 05-deployment-demo P01 | 18min | 3 tasks | 6 files |

## Accumulated Context

### Decisions

- Initialization: Stack - Node.js + Express + React + Vite + SQLite + Prisma
- Initialization: Granularity Standard, execution Sequential, mode YOLO
- Phase 1: Prisma 7.8.0 uses adapter-based client config (prisma-adapter-sqlite)
- Phase 1: SQLite JSON fields stored as serialized String type
- Phase 1: Stateless JWT auth with 24h expiry, no session store
- Phase 1: Rate limited auth (5 req/15min), bcrypt cost 12
- Phase 1: CQRS-lite - SalesTrend pre-computed on write for O(1) dashboard reads
- Phase 1: Dummy data requires "HAPUS" confirmation, never overwrites REAL records
- [Phase 02]: Phase 2 P1: Reused existing dateRangeSchema from sales.schema for dashboard date validation (DRY, single source of truth shared with sales vertical)
- [Phase 02]: Phase 2 P1: DashboardService resolves outlet name via prisma.outlet.findUnique for frontend header (D-17/D-18) without creating a new OutletRepository
- [Phase 02]: Phase 2 P1: Explicit CORS config (CORS_ORIGIN env || localhost:5173, credentials: true) replaces bare cors(); no dashboard rate limiting (T-02-04 accepted, pre-computed SalesTrend reads)
- [Phase 02]: [Phase 02 P02]: Frontend scaffold via npm create vite react-ts (create-vite 9.1.0) — kept the scaffold's 3-file tsconfig project-references layout (tsconfig.json -> tsconfig.app.json + tsconfig.node.json) and applied the plan's compiler options (ES2022, DOM.Iterable, strict, isolatedModules) to tsconfig.app.json; plan said not to manually create tsconfig.node.json
- [Phase 02]: [Phase 02 P02]: Verified both [ASSUMED] packages legitimate via npm view — react-router-dom@7.18.0 (remix-run/react-router, MIT) and date-fns@4.4.0 (date-fns/date-fns, MIT); Task 1 checkpoint self-verified under auto-mode (auto_advance: true) since the checkpoint's own npm-view command is the slopsquatting check (T-02-06)
- [Phase 02]: [Phase 02 P02]: react-chartjs-2@5.3.1 peerDeps explicitly list react ^19.0.0 — no --legacy-peer-deps needed (RESEARCH Pitfall 6 resolved); no chartjs-adapter-date-fns installed (category scale, not time scale, per Pitfall 3)
- [Phase 02]: [Phase 02 P02]: api/client.ts uses TOKEN_KEY='restopulse_token' + Authorization: Bearer header cast (Record<string,string>) + 401 -> clearToken + /login redirect; no credentials: include (Bearer tokens, not cookies — Pitfall 2)
- [Phase 02]: [Phase 02 P02]: DASH-03 (tooltip on touch) left pending — this scaffold delivers infrastructure only; tooltip callbacks ship in Plan 02-05. DASH-01/DASH-02 already complete from Plan 02-01
- [Phase 02]: [Phase 02 P03]: Reordered plan tasks 1 -> 3 -> 2 because Task 2 App.tsx imports DashboardLayout (a Task 3 deliverable); executing Task 3 first keeps every task's tsc --noEmit verify passing with no stubs (Rule 3 blocking fix)
- [Phase 02]: [Phase 02 P03]: AuthContext persists owner {id, username} in localStorage 'restopulse_user' alongside the token so the header username (D-17) survives page refresh; scoped to existing localStorage trust boundary T-02-11 (Rule 2 missing critical functionality)
- [Phase 02]: [Phase 02 P03]: All auth redirects use window.location.href (login->dashboard, logout->login, already-authed->dashboard) for v1 simplicity + consistency with apiClient 401 handler; ProtectedRoute uses children-prop wrapping pattern (not react-router Outlet); chartConfig.ts import deferred to Plan 02-05
- [Phase 02]: [Phase 02 P03]: DASH-03 (tooltip) left pending — this plan delivers auth + layout, not tooltips; requirements mark-complete run with DASH-01 DASH-02 only (both already complete from 02-01, no-op); DASH-03 ships in Plan 02-05
- [Phase 02]: [Phase 02 P04]: Task 1 ran as TDD RED->GREEN — RED 7f6d1f0 added vitest+jsdom+testing-library (all 4 pkgs verified via npm view, T-02-06) + 7 failing tests vs no-op stubs; GREEN 8609de1 implemented usePolling (Page Visibility pause D-13) + useDashboard (30s poll D-10, refresh D-11, useCallback fetcher D-04); 7/7 tests pass
- [Phase 02]: [Phase 02 P04]: defaultDateRange() exported from DateFilter and used by DashboardPage instead of the plan's inline new Date().toISOString() — the latter computes a UTC date that can differ from the '7 Hari' preset's date-fns local date by a day, leaving the preset un-highlighted on first paint (Rule 1 bug prevention); single-source date-fns local-date math
- [Phase 02]: [Phase 02 P04]: D-16 chart grid resolved as grid-cols-1 (Line Chart above, Pie Chart below) per the plan's action text explicit code + acceptance criteria; the must_haves truth 'lg:grid-cols-2 side-by-side' is a stale outlier conflicting with both. vite.config.ts imports defineConfig from vitest/config (not vite) so tsc -b type-checks the test field under tsconfig.node.json types:['node'] (Rule 3 blocking). DASH-03 left pending — ships in 02-05
- [Phase 02]: [Phase 02 P05]: All 3 tasks executed as TDD RED->GREEN (test then feat per task); stub components in each RED commit kept tsc green, matching 02-04 precedent. 6 commits total
- [Phase 02]: [Phase 02 P05]: Chart testing = mock react-chartjs-2 Line/Pie to stub canvases in jsdom + unit-test pure exported helpers (computePointColors, aggregateMenuItems, tooltip formatters); honors tdd=true without canvas flakiness. Resolved stale 'DO NOT create a separate test file' note that referenced the already-complete 02-04
- [Phase 02]: [Phase 02 P05]: Rule 1 fix in lib/format.ts — formatCompactRupiah now uses id-ID comma decimals (Rp 12,0 jt not Rp 12.0 jt) via Intl.NumberFormat; sub-million fallback switched to regular space (was NBSP via currency formatter) for internal consistency; formatRupiah untouched; no prior consumers
- [Phase 02]: [Phase 02 P05]: Rule 3 fix — LineChart tooltip guards context.parsed.y (number|null) with ?? 0; switched per-task verify from tsc --noEmit to npm run build (tsc -b), the stricter authoritative check under the project-references tsconfig layout
- [Phase 02]: [Phase 02 P05]: DASH-03 (tooltip on touch) marked COMPLETE — LineChart tooltip (date+Rupiah, D-06) + PieChart tooltip (name+%+count+revenue, D-07) implemented + unit-tested; on-canvas tooltip appearance deferred to visual UAT. EmptyState CTA -> /data-entry (Phase 3 forward-reference). Phase 02 dashboard functionally complete (DASH-01/02/03 all done)
- [Phase 03]: [Phase 03 P01]: Per-day transactionCount derived from DailySales record presence (1/0) — schema has no transaction_count column and @@unique([outlet_id, date]) makes each daily record the transaction unit. ReportService resolves outlet name via prisma.outlet.findUnique; dateRangeSchema reused (DRY); live SalesTrend + DailySales queries per D-31/D-33b, DailySalesReport snapshot table unused (no population mechanism)
- [Phase ?]: [Phase 03 P02]: useReport mirrors useDashboard verbatim (30s poll, refresh()) — only endpoint path differs. ReportDateFilter ships Harian/Mingguan/Bulanan + custom with Bulanan default via defaultReportDateRange() (D-19/D-20). ReportDailyTable uses overflow-x-auto. ExportButtons handlers optional so 03-03/03-04 wire PDF/CSV without editing layout. Report date state independent in EReportPage useState (D-21).
- [Phase ?]: Phase 03 P03: PDF export engine uses functional autoTable(doc, options) form (not jsPDF.prototype patch) for cleaner ESM import + tree-shaking; multi-page footer uses two-pass stamping (didDrawPage tracks max page count, post-autoTable loop stamps Halaman X/N on every page). ExportButtons dropped optional onExportPDF/onExportCSV props — imports generateReportPDF directly, props simplify to { data }.
- [Phase 03]: [Phase 03 P04]: CSV export engine — custom ~30-LOC generator (no external lib, RESEARCH.md rec) with UTF-8 BOM + semicolon delimiter + Windows CRLF for Indonesian-locale Excel. escapeCell prefixes =/+/-/@ leading chars with tab BEFORE RFC 4180 quoting (T-03-12 formula-injection mitigation); filename sanitized /[^a-zA-Z0-9]/g -> '_' + 'Outlet' fallback (T-03-11); URL.revokeObjectURL after click (T-03-14). ExportButtons csvDisabled flipped from Plan 03-03 placeholder true to !data — both PDF+CSV buttons now active on data (REPT-03, resolves Plan 03-03 CSV stub).
- [Phase 04-quality-assurance]: k6 v2.0.0 installed via winget (Go binary, not npm dummy)
- [Phase 04-quality-assurance]: Lighthouse CLI via execSync chosen over chrome-launcher — zero deps, simpler maintenance
- [Phase 04-quality-assurance]: Puppeteer pre-auth helper (auth-setup.mjs) supplementary — login-only SPA bundle audit is baseline
- [Phase 04]: Touch target fix strategy: py-1.5→py-2.5 on preset/date-input/refresh buttons (36→44px), min-w-[44px] min-h-[44px] on icon-only buttons, py-3 on nav items (34→48px) — pattern-based approach without blanket min-h-[44px] to avoid layout breakage. — WCAG AA practical subset requires ≥44px touch targets. Applied targeted CSS fixes to 6 elements across 5 components.
- [Phase ?]: [04-04] Auth routes (register/login) lack Zod input validation — username/password extracted directly from req.body without schema validation. Major severity per D-55.
- [Phase ?]: [04-04] JWT verifyToken() checks signature + expiry but not payload shape — missing outletId in token passes authMiddleware. Minor severity.
- [Phase ?]: Auto-approved UAT checkpoint under auto_advance mode — UAT session with restaurant owner must be conducted separately using uat-script.md and uat-checklist.md
- [Phase ?]: 04-05: Only 1 Major bug across all 4 prior audits — Auth Zod validation fixed with registerSchema+loginSchema following SalesController pattern. No Critical bugs found.
- [Phase 05]: Hosting: Render.com — backend Web Service + PostgreSQL, frontend Static Site (split deploy)
- [Phase 05]: Database: SQLite local dev, PostgreSQL production (Render) — environment-based Prisma datasource
- [Phase 05]: Demo data: existing "Suntik Data Simulasi" button (no pre-seeded demo account)
- [Phase 05]: Onboarding: short user guide in README, Bahasa Indonesia, for restaurant owners
- [Phase 05]: Monitoring: existing `/health` endpoint only — no external uptime monitoring or structured logging
- [Phase ?]: Prisma 7 does not support env() in datasource provider argument; kept provider as literal string and created separate schema.postgresql.prisma for production
- [Phase ?]: Prisma 7 removed url from schema files; moved connection URL entirely to prisma.config.ts

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Feature | Notifikasi WhatsApp mingguan | v2 | 2026-06-25 |
| Feature | Ekspor CSV | v2 | 2026-06-25 |

## Session Continuity

Last session: 2026-06-27T10:52:55.089Z
Stopped at: Completed 05-01-PLAN.md
Resume file: None
