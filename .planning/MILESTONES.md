# Milestones: RestoPulse

## v1.0 MVP — 2026-06-27

**Shipped:** 2026-06-27
**Phases:** 5 | **Plans:** 23 | **Commits:** 121

### Delivered

RestoPulse v1.0 MVP — Sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran. Dashboard interaktif dengan Line Chart + Pie Chart, E-Report dengan PDF/CSV export, autentikasi JWT, dummy data injector, dan deployment-ready setup.

### Key Accomplishments

1. **Backend Foundation** — Database schema dengan Prisma 7, JWT auth stateless, CQRS-lite SalesTrend pre-computation, rate-limited auth, seed script, centralized error handling
2. **Interactive Dashboard** — Line Chart tren omset harian dengan decline detection + Rupiah tooltip, Pie Chart menu terlaris top-10, 30s polling, 28 unit tests, 451KB bundle
3. **E-Report Engine** — Date-filtered reporting (Harian/Mingguan/Bulanan/Kustom), PDF export jsPDF+autotable multi-page, CSV export UTF-8 BOM + formula-injection guard
4. **Quality Assurance** — 84 tests passing (52 API + 32 frontend), k6 load test 50 VUs, Lighthouse 100/100 accessibility, 7 Major touch target fixes, security audit 0 Critical
5. **Deployment Ready** — Env-aware Prisma (SQLite dev/PostgreSQL prod), Render.com blueprint, README user guide Bahasa Indonesia, enhanced /health endpoint

### Known Gaps at Close (v1.0)

- 5 open artifacts acknowledged (UAT Phase 03, Verification Phases 02/03/04) — see STATE.md Deferred Items
- JWT payload shape validation — Minor, deferred v2
- Chart.js canvas accessibility — Minor, deferred v2

### Archives

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`

---

## v1.1 — Enhanced Features (Planned)

**Target:** 6–7 minggu development  
**PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)

### Scope

v1.1 menambahkan modul Financial, Catering, AI Integration, dan Data Management Redesign sesuai PRD terbaru.

### Milestones (v1.1)

| # | Milestone | Owner | Timeline | Phase Mapping |
|---|-----------|-------|----------|---------------|
| M1 | Foundation — Database, API Core & Auth | Backend Developer | Minggu 1 | Phase 1 |
| M2 | Dashboard — Frontend Analytics & Visualization | Frontend Developer | Minggu 2 | Phase 2 |
| M3 | Data Management — Reset, Simulate & Manual Entry | Full-Stack Developer | Minggu 3 | Phase 3 |
| M4 | Financial Features — Expenses & Profit/Loss | Full-Stack Developer | Minggu 4 | Phase 4 |
| M5 | Catering — CRUD, Dashboard & E-Report Integration | Full-Stack Developer | Minggu 4–5 | Phase 5 |
| M6 | Reports — E-Report, PDF & CSV Export | Full-Stack/Frontend Developer | Minggu 5 | Phase 6 |
| M7 | AI Integration — Gemini Business Summary | Full-Stack Developer | Minggu 6 | Phase 7 |
| M8 | QA & Deployment — Testing, Performance, Security & Launch | QA Engineer + Tim | Minggu 6–7 | Phase 8 |

### Key Deliverables (v1.1)

1. **Data Management Redesign** — Reset Data (konfirmasi dua tingkat, transaction Prisma), Run Simulation (realistic generator, replace confirmation), Manual Entry (Daily Sales, Monthly Expenses, Catering Orders)
2. **Financial Module** — MonthlyExpense CRUD, Profit/Loss card di dashboard, kategori pengeluaran (Bahan Baku, Gaji, Operasional, Lainnya)
3. **Catering Module** — CateringOrder CRUD dengan status workflow (Pending→Confirmed→Done), dashboard summary, section terpisah di E-Report
4. **AI Integration** — Google Gemini ringkasan bisnis otomatis dalam Bahasa Indonesia, rekomendasi singkat, loading state, graceful degradation
5. **Dashboard Enhancements** — KPI cards (revenue, profit/loss, catering), auto-refresh, tooltip interaction
6. **Reports Enhancement** — E-Report mencakup data pengeluaran & catering, PDF/CSV export

### Acceptance Criteria (v1.1)

- Semua FR Must Have (FR-001 s.d. FR-005) dan Should Have (FR-006, FR-007, FR-011, FR-012, FR-013) terimplementasi.
- Semua NFR (9.1–9.6) terverifikasi.
- UAT workflow lengkap: login → simulasi → dashboard → input manual → E-Report → export PDF lancar.

### Archives (v1.1 Planning)

- Root-level planning documents: `planning.md`, `roadmap.md`, `development-roadmap.md`, `phases.md`, `implementation-plan.md`, `milestones.md`, `task-checklist.md`
- Updated: `OPENCODE.md`

---
*Last updated: 2026-06-29 after PRD refresh*
