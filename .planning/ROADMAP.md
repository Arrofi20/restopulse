# Roadmap: RestoPulse

## Overview

RestoPulse akan dibangun dalam 5 fase selama 8 minggu, dimulai dari fondasi database dan autentikasi, lalu dasbor visualisasi, mesin laporan digital, pengujian kualitas, dan terakhir deployment ke production. Setiap fase menghasilkan nilai yang dapat diuji dan diverifikasi.

## Phases

- [ ] **Phase 1: Foundation** — Database schema, authentication, data entry API, and dummy data injector
- [x] **Phase 2: Dashboard** — Frontend scaffold, Line Chart revenue trend, Pie Chart menu analysis, and interactive tooltips (completed 2026-06-26)
- [ ] **Phase 3: E-Report Engine** — Date-filtered reporting, PDF export, and CSV export
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

**Plans**: 4 plans

Plans:

- [ ] 03-01: Implementasi mesin E-Report dengan filter rentang tanggal (harian, mingguan, bulanan)
- [ ] 03-02: Build UI ringkasan laporan (total pendapatan, jumlah transaksi, top items per periode)
- [ ] 03-03: Implementasi PDF export (jsPDF + autotable, header/footer, Rupiah formatting)
- [ ] 03-04: Implementasi CSV export (JSON-to-CSV utility, UTF-8 BOM, semicolon delimiter)

### Phase 4: Quality Assurance

**Goal**: Seluruh fitur Must Have terverifikasi, performa memenuhi NFR, dan sistem siap untuk UAT pemilik restoran.
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, DASH-01, DASH-02, DASH-03, DATA-01, DATA-02, REPT-01, REPT-02
**Success Criteria** (what must be TRUE):

  1. Semua test case untuk FR Must Have lolos (black-box testing)
  2. Load test 50 transaksi bersamaan berhasil dengan response time API ≤500ms
  3. Page load dasbor ≤4 detik terverifikasi pada koneksi 4G (Lighthouse)
  4. UAT oleh pemilik restoran selesai dengan acceptance sign-off

**Plans**: 5 plans

Plans:

- [ ] 04-01: Functional testing (auth flow, data entry, chart rendering, report filtering, export)
- [ ] 04-02: Performance & load testing (API latency, concurrent transactions, database query optimization)
- [ ] 04-03: Mobile responsiveness & accessibility audit (320px–1440px, contrast ratio, font size 24pt)
- [ ] 04-04: Security audit (JWT validation, SQL injection prevention, XSS protection)
- [ ] 04-05: UAT session dengan pemilik restoran dan perbaikan bug kritis

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
| 3. E-Report Engine | 0/4 | Not started | - |
| 4. Quality Assurance | 0/5 | Not started | - |
| 5. Deployment & Demo | 0/4 | Not started | - |
