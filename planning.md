# RestoPulse — Master Planning Document

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## 1. Project Overview

| Attribute | Value |
|-----------|-------|
| **Name** | RestoPulse |
| **Purpose** | Sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran skala kecil-menengah. |
| **Primary Actor** | Pemilik / Manajer Restoran (single-outlet) |
| **Goal** | Agregasi data otomatis, visualisasi interaktif, E-Report siap unduh, pencatatan pengeluaran & catering, serta ringkasan AI untuk pengambilan keputusan bisnis. |

---

## 2. Scope

### 2.1 In Scope (MVP v1)

- **Authentication & Session Management** — Login pemilik dengan username/password, proteksi halaman sensitif.
- **Dashboard Utama Analitik** — Line Chart tren omset harian, Pie Chart menu terlaris, kartu KPI (Total Omset, Hari Tercatat, Laba/Rugi), tooltip interaktif, auto-refresh.
- **Data Management** — Reset Data, Run Simulation (dummy injector), Manual Data Entry (Daily Sales, Monthly Expenses, Catering Orders).
- **Financial Module** — Pencatatan pengeluaran bulanan per kategori, kalkulasi laba/rugi, kartu ringkasan finansial.
- **Catering Module** — CRUD pesanan catering/partai besar dengan status Pending → Confirmed → Done, ringkasan catering di dashboard, section catering di E-Report.
- **Reports (E-Report)** — Filter rentang tanggal (harian/mingguan/bulanan), ekspor PDF, ekspor CSV.
- **AI Features** — Ringkasan otomatis performa bisnis dalam Bahasa Indonesia via Google Gemini, rekomendasi bisnis singkat, loading state, graceful error handling.

### 2.2 Out of Scope (v1)

- Aplikasi pelanggan & menu digital QR Code
- Sistem antrean & layar dapur (KDS)
- Manajemen inventaris & stok gudang (HPP otomatis)
- Integrasi gerbang pembayaran (e-wallet, transfer bank)
- Manajemen multi-outlet / multi-cabang
- Sistem loyalitas & membership
- Ulasan, rating menu, & feedback pelanggan
- Notifikasi otomatis WhatsApp (FR-010)

---

## 3. Functional Requirements (FR) Summary

| FR ID | Requirement | Actor | Priority | MoSCoW |
|-------|-------------|-------|----------|--------|
| FR-001 | Login dengan username & password terdaftar | System | Critical | **M** |
| FR-002 | Validasi hak akses & arah ke Dashboard | System | Critical | **M** |
| FR-003 | Agregasi omset & menu → Line Chart + Pie Chart | System | Critical | **M** |
| FR-004 | Generate & suntik data simulasi harian (Dummy Injector) | Owner | Critical | **M** |
| FR-005 | Saring, hitung, & susun E-Report per filter tanggal | System | Critical | **M** |
| FR-006 | Konversi E-Report ke PDF siap cetak | System | High | **S** |
| FR-007 | Tooltip detail omset & menu terlaris saat titik disentuh | System | High | **S** |
| FR-008 | Ekspor data ringkasan ke CSV | System | Medium | **C** |
| FR-009 | Input data transaksi harian manual (Tanggal, Omset, Menu Terlaris) | Owner | Medium | **C** |
| FR-010 | Notifikasi ringkasan mingguan via WhatsApp | System | Low | **W** |
| FR-011 | Ringkasan AI otomatis (Google Gemini) dalam Bahasa Indonesia | System | High | **S** |
| FR-012 | Input pengeluaran bulanan (Kategori, Nominal, Bulan, Tahun) | Owner | High | **S** |
| FR-013 | Kartu ringkasan laba/rugi (pemasukan vs pengeluaran) | System | High | **S** |
| FR-014 | Input pesanan catering (Nama Klien, Tanggal, Nominal, Status, Catatan) | Owner | Medium | **C** |
| FR-015 | Ringkasan catering di dashboard & section terpisah di E-Report | System | Medium | **C** |

### 3.1 Data Management Module Requirements

The Input/Data page is redesigned around **three primary actions**:

1. **Reset Data**
   - Dedicated button with confirmation dialog.
   - Warning that data cannot be recovered.
   - Deletes: Sales, Expenses, Catering, Reports, Analytics cache, Simulation data.
   - Auto-refresh dashboard and display success notification.

2. **Run Simulation**
   - Select number of days (max 365) and optional start date.
   - Generates realistic historical data: random revenue, random menu sales, random expenses, random catering orders.
   - Automatically regenerates analytics.
   - If dummy data already exists, prompt for explicit confirmation before replacement (per PRD Edge Case).
   - Data should look realistic rather than purely random.

3. **Manual Data Entry**
   - **Daily Sales:** Date, Revenue, Best-selling Menu.
   - **Monthly Expenses:** Category, Amount, Month, Year.
   - **Catering Orders:** Client, Date, Amount, Status (Pending/Confirmed/Done), Notes.

---

## 4. Non-Functional Requirements (NFR)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-9.1 | Dashboard data reflection latency | ≤ 3 detik setelah perubahan DB |
| NFR-9.2 | Uptime selama jam operasional | ≥ 99,5% |
| NFR-9.3 | Page load dasbor & page weight | ≤ 4 detik (4G), ≤ 800 KB |
| NFR-9.4 | API response time (50 transaksi bersamaan) | ≤ 500 ms |
| NFR-9.5 | Data integrity | Perubahan finansial wajib dicatat atomik di StatusLog |
| NFR-9.6 | AI availability | Graceful degradation jika Gemini API tidak tersedia |

---

## 5. Data Entities

| Entity | Key Attributes | Business Constraints |
|--------|----------------|----------------------|
| **OwnerAccount** | AccountID (PK), OutletID (FK), Username, PasswordHash | Satu akun terikat satu outlet; login wajib aman. |
| **DailySales** | SalesID (PK), OutletID (FK), Date, Revenue, TopMenuItems (JSON), DataSource (REAL/DUMMY) | Immutable setelah report di-generate. Reset/simulasi dianggap operasi replace, bukan edit. |
| **SalesTrend** | TrendID (PK), OutletID (FK), Date, Revenue, PerformanceIndex | Dihitung otomatis dari agregasi DailySales. |
| **StatusLog** | LogID (PK), EntityType, EntityID, OldValue, NewValue, ActorID, ChangedAt | Setiap perubahan data finansial wajib dicatat untuk audit. |
| **DailySalesReport** | ReportID (PK), OutletID (FK), PeriodStart, PeriodEnd, TotalRevenue, TopItems (JSON), GeneratedAt | Di-generate otomatis; tidak dapat diedit manual. |
| **MonthlyExpense** | ExpenseID (PK), OutletID (FK), Category, Amount, Month, Year, CreatedAt | Kategori: Bahan Baku, Gaji, Operasional, Lainnya. Immutable setelah report bulanan di-generate. |
| **CateringOrder** | OrderID (PK), OutletID (FK), ClientName, OrderDate, TotalAmount, Status, Notes, CreatedAt | Status hanya bisa maju (Pending→Confirmed→Done). Nominal masuk ke total pendapatan E-Report. |

---

## 6. Success Metrics

| Metric | Baseline | Target (3 bulan) |
|--------|----------|------------------|
| Ketersediaan E-Report Harian & Berkala | 0% (manual) | 100% otomatis & siap akses |
| Akurasi Visualisasi Tren (Line Chart) | N/A | 100% sinkron dengan DB |
| Keberhasilan Ekspor Dokumen Pembukuan | N/A | ≥ 98% unduhan sukses |
| Akurasi Data Pengeluaran & Laba/Rugi | 0% | 100% tercatat & akurat |
| Kelengkapan Data Pesanan Catering | 0% | 100% tercatat & masuk ke E-Report |

---

## 7. Assumptions & Constraints

### 7.1 Assumptions

- Pemilik memiliki perangkat dengan browser modern (Chrome/Safari/Firefox).
- Pemilik melakukan pencatatan/penyuntikan data secara berkala agar visualisasi memiliki kesinambungan historis.
- Koneksi internet stabil saat memuat grafik (Chart.js) dan ekspor dokumen (PDF Engine).
- Pemilik memiliki pemahaman dasar mengoperasikan aplikasi web tanpa pelatihan teknis khusus.

### 7.2 Constraints

- **Single-outlet only** — struktur DB tidak mengakomodasi multi-cabang.
- **Keamanan data finansial** — akses ke dashboard & E-Report wajib dilindungi autentikasi ketat.
- **Format file E-Report** — hanya PDF dan CSV.
- **Tenggat MVP** — 6–7 minggu sejak kickoff pengembangan.

---

## 8. Prioritization

### 8.1 MVP (Must Have)
Fitur esensial yang wajib ada agar produk dapat didemokan dan digunakan:

- FR-001, FR-002: Authentication & Session Management
- FR-003: Dashboard dengan Line Chart & Pie Chart
- FR-004: Run Simulation (Dummy Injector)
- FR-005: E-Report dengan filter tanggal
- FR-009: Manual Data Entry (Daily Sales)
- Reset Data (Data Management)
- NFR-9.1 – NFR-9.5

### 8.2 Nice to Have (Should / Could Have)
Peningkatan yang tidak memblokir MVP:

- FR-006: Export PDF
- FR-007: Tooltip interaktif
- FR-008: Export CSV
- FR-011: AI Ringkasan (Google Gemini)
- FR-012: Monthly Expense Input
- FR-013: Profit/Loss Card
- FR-014: Catering Order Input
- FR-015: Catering Dashboard & E-Report Section
- NFR-9.6: AI graceful degradation

### 8.3 Future Work (Won't Have v1)

- FR-010: Notifikasi WhatsApp otomatis
- Multi-outlet / multi-cabang
- Manajemen inventaris & HPP otomatis
- Sistem loyalitas & membership
- Integrasi POS real-time
- QR Code menu digital pelanggan

---

## 9. Planning Document Index

The following documents comprise the complete RestoPulse planning suite. They must be kept internally consistent:

1. `planning.md` — This document (master scope & requirements).
2. `roadmap.md` — High-level product roadmap & timeline.
3. `development-roadmap.md` — Technical development roadmap.
4. `phases.md` — Detailed phase breakdown (8 phases) with goals, deliverables, dependencies, risks, acceptance criteria, and Definition of Done.
5. `implementation-plan.md` — Technical architecture, API design, schema notes, frontend component structure.
6. `milestones.md` — Milestones mapped to phases.
7. `task-checklist.md` — Granular tasks per milestone (backend, frontend, database, testing, documentation).
8. `OPENCODE.md` — OpenCode configuration & project conventions.

---

*End of Document*
