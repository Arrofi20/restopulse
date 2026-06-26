# Roadmap: RestoPulse

## Overview

RestoPulse akan dibangun dalam 5 fase selama 8 minggu, dimulai dari fondasi database dan autentikasi, lalu dasbor visualisasi, mesin laporan digital, pengujian kualitas, dan terakhir deployment ke production. Setiap fase menghasilkan nilai yang dapat diuji dan diverifikasi.

## Phases

- [ ] **Phase 1: Foundation** — Database schema, authentication, data entry API, and dummy data injector
- [x] **Phase 2: Dashboard** — Frontend scaffold, Line Chart revenue trend, Pie Chart menu analysis, and interactive tooltips (completed 2026-06-26)
- [x] **Phase 3: E-Report Engine** — Date-filtered reporting, PDF export, and CSV export (completed 2026-06-26)
- [ ] **Phase 4: Quality Assurance** — Functional testing, performance testing, mobile optimization, and UAT
- [ ] **Phase 5: Deployment & Demo** — Production deployment, demo data setup, and onboarding documentation

## Phase Details

### Phase 1: Foundation

**Goal**: Sistem backend siap dengan database, autentikasi pemilik, API input data manual, dan generator data simulasi.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, DATA-01, DATA-02
**Success Criteria** (what must be TRUE):

  1. Pemilik dapat login dengan username/password dan diarahkan ke dasbor
  2. Pemilik dapat mengisi formulir data transaksi harian baru
  3. Sistem dapat menyuntikkan 365 hari data simulasi ke database dalam sekali klik
  4. API merespons dengan latency ≤500ms untuk 50 transaksi bersamaan

**Plans**: 5 plans

Plans:

- [ ] 01-01: Design database schema (OwnerAccount, DailySales, SalesTrend, StatusLog, DailySalesReport) dan setup Prisma dengan SQLite
- [ ] 01-02: Implementasi API autentikasi (register/login, bcryptjs hashing, JWT session)
- [ ] 01-03: Implementasi API input data transaksi harian manual (validasi tanggal, omset, menu terlaris)
- [ ] 01-04: Implementasi dummy data injector (generate data fiktif 365 hari dengan distribusi realistis)
- [ ] 01-05: Setup backend validation, error handling, dan seed script

### Phase 2: Dashboard

**Goal**: Dasbor pemilik dapat diakses dengan visualisasi interaktif tren omset dan menu terlaris, serta update data real-time.
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):

  1. Dasbor menampilkan Line Chart riwayat omset harian yang runtut dan akurat
  2. Dasbor menampilkan Pie Chart persentase menu terlaris
  3. Tooltip muncul saat titik grafik disentuh, menampilkan nominal dan menu detail
  4. Data baru muncul di dasbor dalam waktu ≤3 detik setelah input
  5. Halaman dasbor memuat dalam waktu ≤4 detik pada koneksi 4G

**Plans**: 5/5 plans complete

Plans:

- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md
- [x] 02-04-PLAN.md
- [x] 02-05-PLAN.md

**Wave 1**

- [x] 02-01: Backend API — CORS fix + GET /api/dashboard endpoint (SalesTrend data + summary stats)
- [x] 02-02: Frontend scaffold — Vite + React 19 + Tailwind v4 + Chart.js + utilities + API client

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-03: Auth flow + Login page + App shell + layout (Sidebar, Header, DashboardLayout)
- [x] 02-04: Dashboard data layer — usePolling, useDashboard, DateFilter, SummaryCards, DashboardPage shell

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-05: Chart components — LineChart (decline detection), PieChart (top-10 tooltips), EmptyState, Spinner, RefreshButton

### Phase 3: E-Report Engine

**Goal**: Sistem dapat menyaring data keuangan berdasarkan rentang tanggal dan mengekspor laporan ke PDF serta CSV.
**Depends on**: Phase 2
**Requirements**: REPT-01, REPT-02, REPT-03
**Success Criteria** (what must be TRUE):

  1. Pemilik dapat memilih rentang tanggal dan melihat ringkasan laporan di layar
  2. Sistem menghasilkan file PDF yang rapi, siap cetak, dengan format Rupiah Indonesia
  3. Sistem menghasilkan file CSV dengan encoding UTF-8 BOM dan delimiter yang kompatibel Excel
  4. Ekspor berfungsi pada viewport mobile 320px

**Plans**: 4/4 plans complete

Plans:

- [x] 03-01-PLAN.md
- [x] 03-02-PLAN.md
- [x] 03-03-PLAN.md
- [x] 03-04-PLAN.md

**Wave 1**

- [x] 03-01: Backend Report API — GET /api/report with date filtering, SalesTrend + DailySales aggregation

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02: Report UI page — /e-report with date filter, summary cards, daily table, and export button placeholder

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-03: PDF export — jsPDF + autotable with A4 portrait, print-ready white theme, Rupiah formatting

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 03-04: CSV export — UTF-8 BOM, semicolon delimiter, formula injection protection

### Phase 4: Quality Assurance

**Goal**: Seluruh fitur Must Have terverifikasi, performa memenuhi NFR, dan sistem siap untuk UAT pemilik restoran.
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, DASH-01, DASH-02, DASH-03, DATA-01, DATA-02, REPT-01, REPT-02
**Success Criteria** (what must be TRUE):

  1. Semua test case untuk FR Must Have lolos (black-box testing)
  2. Load test 50 transaksi bersamaan berhasil dengan response time API ≤500ms
  3. Page load dasbor ≤4 detik terverifikasi pada koneksi 4G (Lighthouse)
  4. UAT oleh pemilik restoran selesai dengan acceptance sign-off

**Plans**: 3/5 plans executed

Plans:

- [x] 04-01-PLAN.md — Backend test infrastructure (vitest+supertest) + API functional tests (auth, sales, dashboard, report)
- [x] 04-02-PLAN.md — k6 load test (50 VUs, ≤500ms) + Lighthouse frontend audit (≤4s, ≤800KB on 4G)
- [x] 04-03-PLAN.md — Mobile responsiveness audit (320–1440px) + accessibility audit (WCAG AA subset, Lighthouse)
- [ ] 04-04-PLAN.md — Security audit (JWT edge cases, SQL injection, CSV injection, error leakage verification)
- [ ] 04-05-PLAN.md — UAT test script + sign-off checklist (Bahasa Indonesia) + Critical/Major bug fixes

**Wave 1**

- [x] 04-01: Backend test infra + API functional tests — vitest.config.ts, setup.ts, helpers.ts, 4 test suites
- [x] 04-02: k6 load test script + Lighthouse audit script — standalone tools, no code deps on 04-01
- [ ] 04-03: Accessibility audit + manual mobile verification + CSS fixes — no file overlap with 04-01/04-02

**Wave 2** *(blocked on Wave 1: 04-01)*

- [ ] 04-04: Security test suites (JWT + injection) + code review — depends on 04-01 test infrastructure

**Wave 3** *(blocked on Waves 1+2)*

- [ ] 04-05: UAT session + bug fixes — depends on all prior plans for aggregated bug list and system stability

### Phase 5: Deployment & Demo

**Goal**: Sistem beroperasi di production, dokumentasi onboarding tersedia, dan demo berjalan lancar.
**Depends on**: Phase 4
**Requirements**: (Deployment & operational readiness)
**Success Criteria** (what must be TRUE):

  1. Sistem berhasil di-deploy ke production environment
  2. Sistem beroperasi 1 hari penuh tanpa insiden kritis
  3. Dokumentasi onboarding tersedia untuk pemilik restoran
  4. Demo data simulasi siap untuk presentasi

**Plans**: 4 plans

Plans:

- [ ] 05-01: Setup production environment (VPS/PaaS, environment variables, SSL)
- [ ] 05-02: Deploy aplikasi backend dan frontend ke production
- [ ] 05-03: Prepare demo data scenario dan panduan pengguna (bahasa Indonesia)
- [ ] 05-04: Setup monitoring dasar (health check endpoint, error logging)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/5 | Not started | - |
| 2. Dashboard | 5/5 | Complete   | 2026-06-26 |
| 3. E-Report Engine | 4/4 | Complete   | 2026-06-26 |
| 4. Quality Assurance | 3/5 | In Progress|  |
| 5. Deployment & Demo | 0/4 | Not started | - |
