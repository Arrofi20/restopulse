# Phase 2: Dashboard - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the complete frontend application for RestoPulse — a React-based dashboard with interactive visualizations. This includes scaffolding the React + Vite + Tailwind project, building the dashboard layout, implementing Line Chart and Pie Chart with Chart.js, and adding interactive tooltips with real-time data refresh.

**What this phase delivers:**
1. React + Vite + Tailwind CSS project scaffold (dark mode theme)
2. Dashboard layout with left sidebar navigation, top header bar, and responsive grid
3. Line Chart for daily revenue trend visualization (Chart.js, Rupiah formatting, red decline annotations)
4. Pie Chart for menu popularity analysis (Chart.js, top 10 limit, hover tooltips)
5. Interactive tooltips on both charts with date + revenue detail
6. Auto-polling data refresh (30-second interval) with manual refresh button

**What this phase does NOT deliver:**
- E-Report engine or export functionality (Phase 3)
- Data entry forms (Phase 1)
- Performance optimization or load testing (Phase 4)
- Production deployment (Phase 5)

**Success Criteria (from ROADMAP):**
1. Dasbor menampilkan Line Chart riwayat omset harian yang runtut dan akurat
2. Dasbor menampilkan Pie Chart persentase menu terlaris
3. Tooltip muncul saat titik grafik disentuh, menampilkan nominal dan menu detail
4. Data baru muncul di dasbor dalam waktu ≤3 detik setelah input
5. Halaman dasbor memuat dalam waktu ≤4 detik pada koneksi 4G

</domain>

<decisions>
## Implementation Decisions

### Time Period & Filtering
- **D-01:** Default view: last 7 days
- **D-02:** Quick-select preset buttons: 7 Hari (7H), 30 Hari (30H), Bulan Ini, Semua
- **D-03:** Custom date picker (start-end) alongside presets
- **D-04:** Shared filter between Line Chart and Pie Chart
- **D-05:** Summary statistics cards above charts showing total revenue + transaction count

### Chart Interaction
- **D-06:** Line Chart tooltip: date + revenue only
- **D-07:** Pie Chart tooltip: name + percentage + count + revenue contributed
- **D-08:** Revenue decline visual indicator: red point marker + annotation showing drop percentage (e.g., -15%)
- **D-09:** Empty state: message + CTA button to add data ("Belum ada data penjualan untuk periode ini")

### Data Freshness
- **D-10:** Auto-poll interval: 30 seconds
- **D-11:** Manual refresh button alongside auto-poll
- **D-12:** Subtle loading indicator (spinner/shimmer) during refresh, don't replace charts
- **D-13:** Background tab polling: pause when hidden, resume when visible

### Navigation & Layout
- **D-14:** Left sidebar with Dashboard + E-Report links
- **D-15:** Hamburger menu overlay on mobile (320px viewport)
- **D-16:** Chart grid: Line Chart full-width above, Pie Chart below on desktop; side-by-side on desktop, stacked on mobile (Line Chart above, Pie Chart below)
- **D-17:** Top header bar with outlet name + user identity + logout button
- **D-18:** Header bar with outlet name + logout, sidebar with everything including logout at bottom

### the agent's Discretion
- API endpoint choices (new SalesTrend endpoint vs reuse existing GET /api/sales)
- Frontend project directory structure (separate /frontend/ vs monorepo)
- Exact Prisma field types, repository method naming conventions
- Express middleware ordering
- Seed script implementation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core value, business context, constraints, key decisions
- `.planning/ROADMAP.md` — Phase goals, requirements mapping, plan outlines
- `.planning/REQUIREMENTS.md` — Requirement IDs (DASH-01, DASH-02, DASH-03) with descriptions
- `.planning/STATE.md` — Current project state, accumulated decisions, pending todos

### Technical Specifications
- `OPENCODE.md` — Stack constraints (Express, Prisma, SQLite), UI design rules (24pt font, dark mode), Git flow
- `prisma/schema.prisma` — Database schema (OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport)
- `src/` — Backend API source code (controllers, services, repositories, routes, middleware)

### Phase 1 Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (schema design, auth flow, JWT strategy, API design, CQRS-lite, dummy injector rules)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **SalesTrend table** (prisma/schema.prisma): Pre-computed with date, revenue, menu_popularity (JSON string), outlet_id — ready for O(1) dashboard reads
- **JWT auth middleware** (src/middleware/authMiddleware.ts): Stateless, httpOnly cookie — protects API routes
- **Chart.js library** (OPENCODE.md): Mature, lightweight, supports interactive tooltips out-of-the-box

### Established Patterns
- **Layered monolith** (Repository → Service → Controller → Route): Backend architecture pattern from Phase 1
- **CQRS-lite** (SalesTrend pre-computed on write): Write-time aggregation ensures O(1) reads
- **Composite unique index** on [outlet_id, date] in DailySales — prevents duplicate entries
- **data_source enum** (REAL|DUMMY): Prevents data pollution between real and simulated transactions

### Integration Points
- **Auth API** (`POST /api/auth/login`, `POST /api/auth/register`): JWT token returned in httpOnly cookie
- **Sales API** (`GET /api/sales?start=&end=`, `POST /api/sales`): Authenticated requests filter by outlet_id
- **Admin API** (`POST /api/admin/dummy-inject`): Owner-only gated endpoint
- **New dashboard API endpoint needed**: SalesTrend data is pre-computed but no dedicated endpoint exists — either create `/api/dashboard` or reuse `/api/sales` with client-side aggregation

### Creative Options
- **Server-Sent Events (SSE)** for real-time streaming (alternative to polling)
- **Client-side aggregation** of DailySales data for charts (alternative to server-side aggregation)

</code_context>

<specifics>
## Specific Ideas

- Line Chart: full-width, dark background, white/yellow text, 24pt font for financial data
- Pie Chart: top 10 menu items, hover shows name + percentage + count + revenue
- Revenue decline: red point with annotation of drop %, e.g. -15%
- Dashboard layout: left sidebar navigation, hamburger overlay on mobile, top header bar with outlet name + logout
- React + Vite project in separate /frontend/ directory (not monorepo, not integrated in src/server/)
- Chart.js library for Chart.js-specific visualization (line, pie charts)
- Auto-polling: 30s interval, manual refresh button, subtle loading spinner/shimmer, pause when tab hidden, resume when visible
- Rupiah formatting for Indonesian Rupiah (IDR) currency display

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-dashboard*
*Context gathered: 2026-06-26*