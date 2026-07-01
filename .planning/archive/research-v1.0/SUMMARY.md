# Project Research Summary

**Project:** RestoPulse
**Domain:** Restaurant Analytics Dashboard (Small-Medium F&B, Indonesia)
**Researched:** 2026-06-25
**Confidence:** MEDIUM-HIGH

## Executive Summary

RestoPulse is a single-outlet restaurant analytics dashboard targeting Indonesian small-to-medium F&B owners who still reconcile sales manually. Research converges on a **layered monolith** architecture built with **Node.js 22.x LTS**, **React 19 + Vite**, **Express 5.2.1**, and **SQLite + Prisma** — a stack chosen for zero-config deployment, rapid student-team development, and a hard ≤800 KB page-weight budget. The product's core promise is simple: owners manually enter daily revenue and top-selling menu items, then view trend charts and generate printable E-Reports (PDF). This is intentionally lightweight; real-time POS integration, multi-outlet support, and inventory management are explicitly out of scope for the 8-week MVP.

The recommended approach is to build **database schema and auth first** (Weeks 1–2), then **dashboard and data entry** (Weeks 3–4), followed by **reporting and export** (Weeks 5–6), and finally **polish and demo readiness** (Weeks 7–8). This ordering respects the dependency graph: every visual component requires aggregated data, which requires stored sales records, which requires authentication and a solid schema. The most critical architectural decision is to treat `Outlet` as a first-class entity with `outlet_id` foreign keys on all financial tables from day one, even though v1 is single-outlet. This prevents a costly schema rewrite when multi-outlet inevitably arrives in v2.

Key risks cluster around **user trust and data accuracy**. Restaurant owners are time-poor and will abandon the product if manual entry feels burdensome; the dummy data injector must therefore double as an onboarding seeding tool. Indonesia's three timezones (WIB, WITA, WIT) guarantee date-boundary errors unless timezone handling is built into the schema from the start. Chart.js defaults are optimized for aesthetics, not analytical honesty — a pie chart with 30 menu slices or a line chart that interpolates across closed days will mislead owners into bad inventory decisions. Finally, PDF and CSV exports must be generated server-side with Indonesian locale formatting (`Rp 1.500.000`, semicolon-separated CSV with UTF-8 BOM) and tested on 320px mobile viewports from day one, or the core value proposition of "laporan siap cetak" collapses.

## Key Findings

### Recommended Stack

The stack prioritizes **maturity, zero-config deployment, and minimal bundle size**. Node.js 22.x LTS provides stability through late 2027. React 19 with Vite 6 delivers faster builds and smaller bundles than Create React App or Next.js (which adds server-component complexity unnecessary for a non-SEO dashboard). Express 5.2.1 is the de-facto standard for Node APIs. SQLite is chosen over PostgreSQL because the MVP is single-outlet, single-user, and file-based — no separate DB server to deploy. Prisma 7.8.0 provides type-safe generated clients and migration management, lowering the SQL barrier for student developers. Authentication uses bcryptjs (pure JS, no native build headaches) and JWT (stateless, no session store). Chart.js 4.5.1 with react-chartjs-2 is pre-selected in the PRD and handles the required Line and Pie charts. PDF export uses jsPDF + jspdf-autotable (pure JS, no Chromium download), while CSV is handled by a 20-line native utility to keep bundle size down. Tailwind CSS 4.3.1 enables rapid dark-mode prototyping. Supporting libraries include date-fns (Indonesian date formatting), zod (runtime validation), and lucide-react (lightweight SVG icons).

**Core technologies:**
- **Node.js 22.x LTS (Jod):** JavaScript runtime — active LTS until late 2027, maximum package compatibility, stable for student teams.
- **React 19 + Vite 6:** UI library and build tool — standard dashboard ecosystem, aggressive tree-shaking for ≤800 KB budget, faster cold-start than CRA.
- **Express 5.2.1:** HTTP backend — minimal, well-documented, huge middleware ecosystem.
- **SQLite + better-sqlite3 + Prisma 7.8.0:** Database stack — zero-config file-based DB, fastest Node SQLite driver, auto-generated type-safe client with migrations.
- **bcryptjs + jsonwebtoken:** Auth — pure-JS password hashing, stateless JWT sessions (no session store needed for single-user app).
- **Chart.js 4.5.1 + react-chartjs-2:** Charts — official React wrapper, built-in tooltips, tree-shaking support.
- **Tailwind CSS 4.3.1:** Styling — utility-first, trivial dark-mode, purges unused styles.
- **jsPDF 4.2.1 + jspdf-autotable 3.8.x:** PDF export — mature client-side generation, handles tables and page breaks without Chromium overhead.

### Expected Features

The feature landscape is sharply divided into **table stakes** (must-have for credibility), **differentiators** (value-adds that set the product apart), and **anti-features** (scope creep that must be explicitly rejected). Table stakes include secure owner authentication, revenue trend line chart, top-selling menu pie chart, interactive chart tooltips, date-filtered E-Report engine, PDF export, CSV export, and manual daily sales entry. Differentiators include a one-click dummy data injector (critical for demo and UAT in an academic project), sub-3-second dashboard refresh, high-contrast dark mode, audit log for financial changes, and auto-generated daily report summary. Anti-features that must be deferred include real-time POS integration, multi-outlet support, customer-facing QR code menu, WhatsApp auto-notifications, inventory/stock management, loyalty systems, and customer reviews.

**Must have (table stakes):**
- **Secure Owner Authentication** — financial data is sensitive; no login = no trust.
- **Manual Daily Sales Entry** — the primary data source for the MVP (no POS integration).
- **Revenue Trend Line Chart** — the core value proposition; owners need to see daily ups and downs.
- **Top-Selling Menu Pie Chart** — expected complement to trend analysis for stock/promo decisions.
- **Interactive Chart Tooltips** — modern UX expectation; instant detail on hover/tap.
- **Date-Filtered E-Report Engine** — period-based reports are essential for business evaluation.
- **PDF Export for Reports** — formal document for archives and accountant handoff.

**Should have (competitive):**
- **One-Click Dummy Data Injector** — enables instant demo and UAT without waiting for real data; rare in commercial products but invaluable for academic/demo contexts.
- **Sub-3-Second Dashboard Refresh** — gives a "live system" feel after manual entry.
- **High-Contrast Dark Mode Dashboard** — owners often check data at night; 24pt font for financial figures is a hard accessibility requirement.
- **Audit Log for Financial Changes** — builds trust by tracking every revenue modification.

**Defer (v2+):**
- **CSV Export** — trivial to add later (low complexity), defer until PDF is stable.
- **Real-Time POS Integration** — requires hardware, APIs, and security certification; not feasible in 8 weeks.
- **Multi-Outlet / Multi-Cabang** — changes architecture from single-tenant to multi-tenant; deploy separate instances in v1.
- **Inventory / Stock Management** — entire domain of its own; explicit scope creep.

### Architecture Approach

The recommended architecture is a **Layered Monolith** with four horizontal tiers: Presentation (React + Chart.js + Tailwind), API (Express REST controllers), Service (business logic with pure functions), and Data Access (Repository pattern over Prisma/SQLite). A fifth tier, the Database, uses SQLite with WAL mode. This is not microservices — distributed architecture would be catastrophic over-engineering for an 8-week, single-user MVP. Key patterns include: **Repository Pattern** (abstract all DB queries for testability and future DB swaps), **Service Layer with Pure Functions** (no HTTP context in business logic), **CQRS-lite for Dashboard Reads** (pre-compute `SalesTrend` on write so dashboard reads are O(1)), **Audit Log as Separate Transaction** (immutable `StatusLog` records written atomically with every `DailySales` mutation), **Thin API + Thick Client for Charts** (backend sends ready-to-render JSON; frontend does minimal transformation), and **Async Export Generation** (stream PDF/CSV directly or queue for large reports).

**Major components:**
1. **Auth Controller + Service** — login/logout, JWT generation, password hashing (bcryptjs). All other endpoints are protected.
2. **Sales Controller + Service** — CRUD for daily sales, business-rule validation (no future dates, positive revenue), audit logging.
3. **Aggregation Service** — pre-computes trend lines and menu popularity percentages into `SalesTrend` table on every write.
4. **Dashboard Controller** — serves pre-aggregated chart data (`GET /api/dashboard/summary`) for fast reads.
5. **Report Controller + Service** — date-range filtering, report aggregation, cached report snapshots.
6. **Export Service** — server-side PDF (jsPDF + autotable) and CSV generation from report data.
7. **Dummy Service + Controller** — admin-gated bulk generation of simulated historical data; triggers recomputation of all trends.

### Critical Pitfalls

Research identified **10 critical pitfalls** that can cause rewrites, user abandonment, or major credibility loss. The top risks are summarized below; the full analysis is in [PITFALLS.md](PITFALLS.md).

1. **Manual Data Entry Fatigue Leading to Abandonment** — Restaurant owners are time-poor. After 2–3 weeks, data entry often stops, turning the dashboard into a "ghost town." **How to avoid:** Build the dummy injector as a "seed my first week" onboarding tool; pre-fill today's date; allow single-field quick entry; add a "days since last entry" nudge indicator.
2. **Charts That Mislead the Business Owner** — A pie chart with 30+ menu items or a line chart that interpolates across missing days leads to bad stock/promo decisions. **How to avoid:** Cap pie chart to top 5 + "Lainnya"; never interpolate null days; label axes with units (`Rp Juta`); add a footer note: "Data menunjukkan hari dengan input saja."
3. **PDF/CSV Export Breaks on Mobile or Produces Garbled Content** — PDFs fail on Android, CSVs break in Indonesian Excel (expects semicolons), and characters like `é` or `ö` render as boxes without embedded fonts. **How to avoid:** Generate PDFs server-side with jsPDF; test on 320px width from day one; use `sep=;` header and UTF-8 BOM for CSV; embed a Latin-Extended web-safe font (e.g., Roboto).
4. **Timezone and Date-Boundary Errors** — Indonesia spans WIB, WITA, and WIT. A sale entered at 23:30 in Makassar can be recorded as "tomorrow" if the server uses WIB. **How to avoid:** Store UTC timestamps but record the outlet's timezone explicitly (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`) in the database; use timezone-aware `DATE_TRUNC` for all aggregations; display dates as `25 Juni 2026`.
5. **Dummy Data Accidentally Polluting or Overwriting Real Data** — The dummy injector is powerful. A single misclick can wipe irreplaceable financial history. **How to avoid:** Require typed confirmation (e.g., type "HAPUS"); add a `data_source` enum (`REAL`, `DUMMY`) on every transaction; tag dummy data visually in UI; never allow dummy injection to delete real records (soft-delete or replace dummy-flagged rows only).
6. **Over-Engineering Visual Design for a Non-Technical User** — Animations, gradients, and 12px grey-on-black text look great on Dribbble but are unreadable on a budget Android in bright sunlight. **How to avoid:** Treat PRD accessibility requirements (24pt font, high contrast, ≤800 KB, ≤4s load on 4G) as hard functional requirements; test on a 2-year-old Android with 720p screen and 3G throttling.
7. **Security Theater That Frustrates the Owner** — Complex password rules and forced resets create friction without addressing real threats (SQL injection, XSS, IDOR). **How to avoid:** 8-character minimum password, bcrypt hashing, rate limiting after 5 failed attempts, parameterized queries, and row-level security on every endpoint. No forced password resets.
8. **Death by Polling — Dashboard "Real-Time" Update Kills Performance** — Polling every 2 seconds hammers the database and degrades response times under load. **How to avoid:** Use Server-Sent Events (SSE) or a 30-second polling interval with exponential backoff when the tab is inactive; cache aggregated data with 60s TTL; pre-compute `SalesTrend` daily rather than on every request.

## Implications for Roadmap

Based on research, the suggested phase structure mirrors the architecture's natural dependency order while grouping features by user-visible deliverables:

### Phase 1: Foundation & Auth
**Rationale:** Every other component depends on persisted data and authenticated access. Schema decisions made here (timezone handling, `outlet_id` foreign keys, `data_source` enum) are irreversible without painful migrations. Starting with auth ensures all subsequent endpoints are protected by default.
**Delivers:** SQLite database schema (OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport), Prisma migrations, Repository layer (OwnerRepo, DailySalesRepo, SalesTrendRepo, StatusLogRepo, DailyReportRepo), JWT-based Auth API (login/logout, password hashing), and Zod validation schemas.
**Addresses:** Secure Owner Authentication (P1), schema foundation for Manual Daily Sales Entry.
**Avoids:** Pitfall 4 (timezone errors — `Outlet.timezone` enum from day one), Pitfall 5 (dummy data pollution — `data_source` enum + soft-delete), Pitfall 10 (rigid single-outlet schema — `outlet_id` FK on all financial tables), Pitfall 7 (security theater — simple password policy + real threat mitigation).

### Phase 2: Core Dashboard & Data Entry
**Rationale:** The dashboard is the core value proposition. It needs data to be meaningful, so manual entry and the dummy injector must ship together. Building the frontend after the Aggregation Service ensures the API contract is stable before React components consume it.
**Delivers:** Sales API (POST /api/sales with validation and audit logging), Aggregation Service (pre-compute SalesTrend on write), Dashboard API (GET /api/dashboard/summary), Frontend Dashboard page (Line Chart + Pie Chart with Chart.js), Manual Data Entry form, Dummy Data Injector (admin-gated with typed confirmation), and SSE or polling mechanism for refresh.
**Addresses:** Manual Daily Sales Entry (P1), Dummy Data Injector (P1 — critical for demo), Revenue Trend Line Chart (P1), Top-Selling Menu Pie Chart (P1), Interactive Tooltips (P1), Sub-3-Second Dashboard Refresh (P2).
**Avoids:** Pitfall 1 (entry fatigue — dummy injector seeds first week + minimal-friction form), Pitfall 2 (misleading charts — cap pie at 5+others, no interpolation), Pitfall 6 (over-engineered visuals — enforce 24pt font, high contrast, performance budget), Pitfall 8 (death by polling — design SSE/polling architecture now), Pitfall 12 (mobile tooltip failure — test on real touchscreens).

### Phase 3: Reporting & Export Engine
**Rationale:** E-Report is a key deliverable for the academic project. Export functionality (PDF/CSV) depends on the Report Service, which depends on DailySales aggregation. This phase is self-contained and can be built in parallel with Phase 2 once the database schema is stable, but sequencing it after the dashboard allows the team to reuse aggregation logic.
**Delivers:** Report Service (date-range filtering, totals, averages, top items), Report API (GET /api/reports), Export Service (server-side PDF with jsPDF + autotable, CSV with UTF-8 BOM and semicolon separator), E-Report frontend page (filter UI, preview table, download buttons), and Indonesian locale formatting utility (`locale.config.js` or `formatUtils.js`).
**Addresses:** Date-Filtered E-Report Engine (P1), PDF Export (P1), CSV Export (P2).
**Avoids:** Pitfall 3 (PDF/CSV mobile breakage — server-side generation, 320px testing, embedded fonts), Pitfall 9 (Indonesian localization gaps — consistent `id-ID` formatting everywhere), Pitfall 11 (empty date ranges — actionable empty state with manual entry / dummy injection shortcuts), Pitfall 13 (fiscal period mismatch — store `report_period_start` and `report_period_end` explicitly).

### Phase 4: Polish, Performance & Demo Readiness
**Rationale:** Performance optimization should only happen after features are complete and metrics are measured. This phase also includes final demo affordances (dark mode, real-time updates) and UAT with a non-technical user.
**Delivers:** High-contrast dark mode dashboard, performance optimization (DB indexing on `date` column, query optimization, bundle minification), audit log frontend view (if time permits), Service Worker for offline shell caching, and UAT session with a non-technical "pemilik warung."
**Addresses:** High-Contrast Dark Mode Dashboard (P2), Audit Log for Financial Changes (P2 — if time permits), Auto-Generated Daily Report Summary (P3).
**Avoids:** Pitfall 6 (performance budget violations — Lighthouse audit, bundle analysis), Pitfall 15 (offline errors — simple Service Worker caching last-known data), Pitfall 14 (ambiguous pie chart metric — label explicitly: "berdasarkan Omset").

### Phase Ordering Rationale

- **Database → Repositories → Auth → Sales → Aggregation → Dashboard → Reports → Export → Polish** is the only order that respects the dependency graph. You cannot render charts without aggregated data, cannot aggregate without stored sales, and cannot store sales without a schema and auth.
- **Grouping by user-visible deliverables** (Dashboard, E-Report) ensures each phase produces something demoable, which is critical for an 8-week academic timeline.
- **Placing the dummy injector in Phase 2** (not Phase 4) is essential because it doubles as an onboarding tool to prevent abandonment (Pitfall 1), not just a demo gimmick.
- **Deferring CSV to Phase 3** is safe because it is low complexity and depends only on the Report Service; PDF is prioritized because it is the primary deliverable for accountants.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Core Dashboard):** Chart.js mobile touch interactions and accessibility for non-technical, 50+ year-old users on budget Android devices. Need hands-on testing of tap-to-drill-down vs. hover tooltips.
- **Phase 3 (E-Report):** jsPDF Indonesian font embedding and mobile viewport rendering. Need to verify that jsPDF + autotable handles 320px layouts and Latin Extended characters correctly before committing to server-side generation.
- **Phase 4 (Polish):** Performance budget validation — actual Vite bundle size measurement and Lighthouse mobile audit once Chart.js and Tailwind are included.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** JWT auth, Prisma migrations, Repository pattern, and Express controllers are well-documented, established patterns with abundant examples.
- **Phase 3 (Report Service):** Date-range SQL aggregation and JSON-to-CSV transformation are standard backend tasks.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages are mature (Express ~110M weekly downloads, Tailwind ~120M, Prisma ~13.6M). Versions are current stable releases with official documentation. Rationale for avoiding Next.js/PostgreSQL/Puppeteer is sound for an 8-week MVP. |
| Features | MEDIUM | Feature list is derived directly from the PRD and competitor analysis (TouchBistro, Toast). Table stakes are clear. However, no real restaurant owner has been interviewed for validation; the "manual entry fatigue" risk is inferred from SaaS failure patterns, not empirical user research. |
| Architecture | HIGH | Layered monolith is a textbook pattern for this scale. Component boundaries and data flows are cleanly mapped to the PRD entities. The 8-week build order is realistic and respects all identified dependencies. CQRS-lite and Repository patterns are well-documented. |
| Pitfalls | MEDIUM-HIGH | Synthesized from dashboard UX research, small-business SaaS failure patterns, and Indonesian market context (timezones, mobile-first, Excel locale). Most are preventable with the recommended mitigations. Some (e.g., exact manual entry abandonment rate) need empirical validation during UAT. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **User Validation:** No non-technical restaurant owner has been interviewed. The feature prioritization and "entry fatigue" risk are inferred. Mitigation: recruit at least one "pemilik warung" for a 30-minute UAT session in Phase 4.
- **Chart.js Mobile Touch Behavior:** The research assumes tap interactions can be adapted, but hands-on testing on a real touchscreen device (not just Chrome DevTools) is needed before finalizing the Phase 2 plan.
- **Actual Bundle Size Measurement:** The ≤800 KB budget is theoretical until Vite is configured and Chart.js + Tailwind are imported. Mitigation: measure bundle size immediately after scaffolding the project in Phase 1.
- **Load Testing Plan:** The "≤500ms API response" and "≤4s dashboard load" targets need a defined load testing approach (e.g., k6 or Artillery) for 50 concurrent transactions. Mitigation: add a performance benchmark script in Phase 4.
- **Deployment Target:** Research assumes a single Node.js process on a VPS or PaaS (Render, Railway, VPS), but no specific deployment platform has been selected. This affects environment variable handling and timezone configuration.

## Sources

### Primary (HIGH confidence)
- [STACK.md](STACK.md) — Official package documentation and npm registry data for version selection.
- [FEATURES.md](FEATURES.md) — PRD RestoPulse v1.0 (Team Nasi Durian, 28 Mei 2026) and PROJECT.md (2026-06-25) for scope constraints and MoSCoW prioritization.
- [ARCHITECTURE.md](ARCHITECTURE.md) — Martin Fowler "Patterns of Enterprise Application Architecture" (Repository Pattern, Service Layer); Chart.js Documentation (chartjs.org); Google Web Fundamentals (performance budgets); OWASP Cheat Sheet Series (session management).
- [PITFALLS.md](PITFALLS.md) — PRD RestoPulse v1.0 and PROJECT.md for project-specific constraints; RIB Software "25 Dashboard Design Principles & Best Practices" (2024) for general BI anti-patterns.

### Secondary (MEDIUM confidence)
- TouchBistro Blog: "How Your Restaurant Analytics Can Help Increase Revenue" (2021, updated context) — competitor feature analysis for table stakes validation.
- Ekosistem POS Analytics umum: Toast, Square, Lightspeed — industry standard feature benchmarking.
- Small-business SaaS failure pattern analysis — manual data entry abandonment rates and mobile-first constraints for the Indonesian market.

### Tertiary (LOW confidence)
- No primary user interviews conducted; user persona assumptions (time-poor owner, budget Android device, 50+ age) are inferred from the PRD and general Indonesian SME demographics. Needs validation during UAT.

---
*Research completed: 2026-06-25*
*Ready for roadmap: yes*
