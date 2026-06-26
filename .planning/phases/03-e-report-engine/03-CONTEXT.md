# Phase 3: E-Report Engine - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers the E-Report Engine for RestoPulse — a date-filtered financial reporting system with PDF and CSV export capabilities. This includes the report aggregation API, report preview UI, and export functionality that allows restaurant owners to download their financial reports.

**What this phase delivers:**
1. Backend E-Report API endpoint (`GET /api/report`) with date filtering and aggregation
2. Report preview page (`/e-report`) with date range filter and summary statistics
3. PDF export engine (jsPDF + autotable) with Rupiah formatting and print-ready layout
4. CSV export engine (UTF-8 BOM, semicolon delimiter) with raw transaction data
5. Mobile-responsive export UI (viewport down to 320px)

**What this phase does NOT deliver:**
- Real-time report generation or scheduling (out of scope)
- WhatsApp report delivery (v2, deferred)
- Multi-format exports beyond PDF and CSV
- Report templates or custom branding beyond outlet name

**Success Criteria (from ROADMAP):**
1. Pemilik dapat memilih rentang tanggal dan melihat ringkasan laporan di layar
2. Sistem menghasilkan file PDF yang rapi, siap cetak, dengan format Rupiah Indonesia
3. Sistem menghasilkan file CSV dengan encoding UTF-8 BOM dan delimiter yang kompatibel Excel
4. Ekspor berfungsi pada viewport mobile 320px

**Requirements:** REPT-01, REPT-02, REPT-03

</domain>

<decisions>
## Implementation Decisions

### Report Period & Filtering
- **D-19:** Report date presets: Harian (today), Mingguan (last 7 days), Bulanan (current month), plus custom date range picker
- **D-20:** Default report view: Bulanan (current month) — natural for financial review
- **D-21:** Report filter is INDEPENDENT of dashboard filter — E-Report has its own date state
- **D-22:** Reuse existing DateFilter component pattern from dashboard but adapt presets for reporting (Harian/Mingguan/Bulanan/Custom)

### Report Content & Layout
- **D-23:** Report preview shows: outlet name, report period, total revenue, transaction count, top menu items, daily breakdown table
- **D-24:** PDF layout: A4 portrait, header with outlet name + period, summary stats cards, daily detail table, footer with generation date
- **D-25:** PDF styling (screen preview): dark background (matching app theme), white text, Rupiah formatting, 12pt minimum font for readability
- **D-25b:** PDF styling (exported file): **white paper background with dark text** — auto-switches from dark preview to print-ready light theme for ink efficiency and print standard compliance
- **D-26:** CSV structure: one row per day — columns: Tanggal, Omset (Rp), Menu Terlaris, Jumlah Transaksi

### Export UX
- **D-27:** Owner sees report preview on screen FIRST, then clicks Export PDF / Export CSV buttons
- **D-28:** Export buttons positioned at top-right of report preview, sticky on scroll
- **D-29:** File naming convention: `Laporan_{OutletName}_{StartDate}_{EndDate}.{pdf|csv}` (e.g., `Laporan_RestoUtama_2026-06-01_2026-06-30.pdf`)
- **D-30:** Export triggers browser download (no server-side file storage)
- **D-30b:** CSV export STAYS in Phase 3 — confirmed in-scope. REQUIREMENTS.md should be updated to mark REPT-03 as v1/Phase 3.

### Data Source
- **D-31:** Report API reads from SalesTrend table (pre-computed aggregations) for summary + DailySales for detailed breakdown
- **D-32:** Report endpoint: `GET /api/report?start=YYYY-MM-DD&end=YYYY-MM-DD&format=summary` (returns aggregated data for preview)
- **D-33:** Export endpoints: `GET /api/report/export?start=&end=&type=pdf` and `type=csv`
- **D-33b:** Data source strategy (live query vs cached snapshot) — **agent discretion**. Live query from SalesTrend + DailySales is preferred given existing CQRS-lite pattern; DailySalesReport cached table exists in schema but has no population mechanism yet.

### Mobile Behavior
- **D-34:** Report preview stacks vertically on mobile (summary → table → export buttons)
- **D-35:** Export buttons are full-width on mobile (320px) for easy tap targets
- **D-36:** PDF/CSV generation happens client-side to avoid server processing delays on mobile networks

### the agent's Discretion
- Exact jsPDF configuration (margins, fonts, page breaks)
- CSV generation library choice (papaparse vs custom vs JSON-to-CSV)
- Report table styling (Tailwind classes, responsive breakpoints)
- Backend aggregation query optimization (Prisma aggregation vs raw computed)
- Data source implementation: live query vs cached snapshot (DailySalesReport table exists but unused)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core value, business context, constraints, key decisions
- `.planning/ROADMAP.md` — Phase goals, requirements mapping, plan outlines
- `.planning/REQUIREMENTS.md` — Requirement IDs (REPT-01, REPT-02, REPT-03) with descriptions
- `.planning/STATE.md` — Current project state, accumulated decisions, pending todos

### Phase 1 & 2 Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Schema design, auth flow, API patterns
- `.planning/phases/02-dashboard/02-CONTEXT.md` — UI decisions, component patterns, data fetching

### Technical Specifications
- `OPENCODE.md` — Stack constraints, UI design rules (24pt font, dark mode), Git flow
- `prisma/schema.prisma` — Database schema (OwnerAccount, Outlet, DailySales, SalesTrend, DailySalesReport)
- `src/` — Backend API source code (controllers, services, repositories, routes)
- `frontend/src/` — Frontend React application

### Reusable Components from Phase 2
- `frontend/src/components/dashboard/DateFilter.tsx` — Date range selector with presets (adapt for reporting presets: Harian/Mingguan/Bulanan/Custom)
- `frontend/src/lib/format.ts` — `formatRupiah()`, `formatCompactRupiah()` — Rupiah formatting
- `frontend/src/api/client.ts` — Bearer-token API client with 401 redirect
- `frontend/src/components/layout/DashboardLayout.tsx` — Sidebar + Header + main content layout
- `frontend/src/hooks/usePolling.ts` — Polling hook (can be adapted for report refresh)
- `frontend/src/types/dashboard.ts` — TypeScript types (DateRange, DashboardData)

### Backend Patterns from Phase 1-2
- `src/controllers/DashboardController.ts` — Controller pattern with ZodError handling
- `src/services/DashboardService.ts` — Service pattern with date validation
- `src/repositories/SalesTrendRepository.ts` — Repository pattern with findByDateRange and aggregateSummary
- `src/middleware/authMiddleware.ts` — JWT Bearer token auth
- `src/routes/` — Express Router pattern with authMiddleware

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **SalesTrend table** (`prisma/schema.prisma`): Pre-computed with date, revenue, menu_popularity (JSON string), outlet_id
- **DailySales table**: Raw transaction records with date, revenue, top_menu_items (JSON), data_source enum
- **DailySalesReport table**: Cached snapshot schema exists (period_start, period_end, total_revenue, transaction_count, top_items) but is currently unused
- **Dashboard API** (`GET /api/dashboard`): Returns `{outlet, trends[], summary{totalRevenue, transactionCount, topItems[]}}` — pattern to follow for report API
- **DateFilter component**: Preset buttons + custom date picker, already dark-themed. Exports `defaultDateRange()` for consistent initialization
- **format.ts**: `formatRupiah(1234567)` → `Rp 1.234.567`; `formatCompactRupiah()` for compact labels
- **EReportPage**: Placeholder at `/e-report` — needs full implementation

### Established Patterns
- **Layered monolith**: Repository → Service → Controller → Route
- **CQRS-lite**: SalesTrend pre-computed on write for O(1) dashboard reads
- **JWT Bearer auth**: localStorage token (`restopulse_token`), Authorization header, 401 → clear + redirect
- **Dark mode**: Tailwind `dark` class on html, amber-400/yellow for accents, red-500 for warnings
- **Error format**: `{ success: false, error: { code, message, details } }`

### Integration Points
- **New route mount**: Add `app.use('/api/report', reportRoutes)` in `src/app.ts`
- **New page route**: Add `/e-report` route in `frontend/src/App.tsx` (already in sidebar nav)
- **Data reuse**: Report page can reuse `useDashboard` hook pattern for data fetching, but with independent date state (D-21)

</code_context>

<specifics>
## Specific Ideas

- Report preview page should mirror the dashboard summary cards but add a detailed daily table
- PDF should be generated client-side using jsPDF + autotable to avoid backend complexity
- PDF export must auto-switch from dark preview to white paper + dark text for print readiness
- CSV should use semicolon (;) delimiter and UTF-8 BOM for Excel compatibility (Indonesian Excel uses semicolon by default)
- Mobile: export buttons should be full-width below the preview, not side-by-side
- Reuse the existing `DateFilter` component but swap presets to Harian (today) / Mingguan (last 7d) / Bulanan (current month) / Custom
- Report API should return both summary (aggregated) and detail (per-day) in one response to minimize API calls

</specifics>

<deferred>
## Deferred Ideas

- **WhatsApp report delivery** — v2 requirement (NOTF-01), explicitly out of scope for v1
- **Scheduled/automated reports** — new capability, could be its own phase
- **Report email delivery** — new capability, belongs in a notifications phase
- **Custom report templates** — nice-to-have, could be Phase 4+ enhancement

</deferred>

---

*Phase: 03-e-report-engine*
*Context gathered: 2026-06-26*
*Updated: 2026-06-26*
