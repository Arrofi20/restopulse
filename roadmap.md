# RestoPulse — Product Roadmap

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## Overview

Roadmap ini memetakan seluruh fitur RestoPulse dari fondasi teknis hingga peluncuran produksi. Setiap fase dirancang untuk menghasilkan increment yang dapat didemokan dan diuji secara independen. Urutan implementasi dipilih untuk meminimalkan dependency blocking dan memaksimalkan early feedback.

---

## Roadmap Timeline

| Phase | Name | Focus | Duration | Week |
|-------|------|-------|----------|------|
| **Phase 1** | Foundation | Project setup, Auth, DB, Prisma, API architecture, core layouts | 1 minggu | W1 |
| **Phase 2** | Dashboard | Dashboard UI, KPI cards, Charts, Analytics, Auto refresh | 1 minggu | W2 |
| **Phase 3** | Data Management | Reset Data, Run Simulation, Manual Data Entry | 1 minggu | W3 |
| **Phase 4** | Financial Features | Expenses, Profit/Loss, Financial cards | 0.5–1 minggu | W4 |
| **Phase 5** | Catering | Catering CRUD, Dashboard summary, E-Report integration | 0.5–1 minggu | W4–W5 |
| **Phase 6** | Reports | E-Report, PDF Export, CSV Export, Date filtering | 1 minggu | W5 |
| **Phase 7** | AI Integration | Gemini integration, Business summary, Recommendations, Error handling | 0.5–1 minggu | W6 |
| **Phase 8** | QA & Deployment | Testing, Performance, Security, Deployment, Final polish | 1 minggu | W6–W7 |

**Total Estimated Duration:** 6–7 minggu.

---

## Phase Summaries

### Phase 1 — Foundation
**Goal:** Membangun fondasi teknis yang kokoh agar pengembangan fitur berjalan paralel tanpa hambatan arsitektural.

**Key Deliverables:**
- Repositoy terstruktur (monorepo: backend + frontend).
- Database PostgreSQL & Prisma ORM dengan semua entitas (OwnerAccount, DailySales, SalesTrend, StatusLog, DailySalesReport, MonthlyExpense, CateringOrder).
- API RESTful dengan Express.js, Zod validation, CORS, rate limiting.
- Authentication (register/login) dengan bcrypt + JWT.
- Middleware proteksi route & session management.
- Core layout frontend (sidebar, header, routing) dengan React + Vite + Tailwind CSS.
- Health check endpoint & environment configuration.

**FRs Covered:** FR-001, FR-002

---

### Phase 2 — Dashboard
**Goal:** Menyediakan dasbor analitik utama yang menarik, interaktif, dan responsif.

**Key Deliverables:**
- Dashboard page dengan dark theme (background gelap, teks putih/kuning).
- KPI cards: Total Omset, Hari Tercatat, Rata-rata Harian.
- Line Chart tren omset harian (Chart.js / react-chartjs-2).
- Pie Chart menu terlaris.
- Tooltip interaktif saat titik grafik disentuh.
- Auto-refresh data (polling / async fetching) dengan latensi ≤ 3 detik.
- Date range presets: 7 Hari, 30 Hari, 90 Hari, Custom.
- Empty state handling & loading skeletons.

**FRs Covered:** FR-003, FR-007

---

### Phase 3 — Data Management
**Goal:** Memberikan kontrol penuh kepada pemilik atas data aplikasi melalui tiga aksi utama: Reset, Simulasi, dan Entri Manual.

**Key Deliverables:**
- **Reset Data:** Tombol dengan dialog konfirmasi dua tingkat, penghapusan semua data transaksional + cache analytics, notifikasi sukses, auto-refresh dashboard.
- **Run Simulation:** Form pilihan jumlah hari & tanggal mulai opsional. Generator data realistis (revenue, menu sales, expenses, catering). Konfirmasi eksplisit jika data simulasi sudah ada. Regenerasi analytics otomatis.
- **Manual Data Entry:**
  - Form Daily Sales (Date, Revenue, Best-selling Menu).
  - Form Monthly Expenses (Category, Amount, Month, Year).
  - Form Catering Orders (Client, Date, Amount, Status, Notes).
- Validasi form (Zod) dan notifikasi sukses/error.

**FRs Covered:** FR-004, FR-009, FR-012, FR-014

---

### Phase 4 — Financial Features
**Goal:** Memantau kesehatan finansial bisnis melalui pencatatan pengeluaran dan kalkulasi laba/rugi.

**Key Deliverables:**
- Backend API CRUD untuk MonthlyExpense.
- Frontend form & list pengeluaran bulanan.
- Kartu ringkasan laba/rugi di dashboard (pemasukan − pengeluaran).
- Warna indikator: hijau/kuning untuk untung, merah untuk rugi.
- Integrasi pengeluaran ke agregasi dashboard & E-Report.

**FRs Covered:** FR-012, FR-013

---

### Phase 5 — Catering
**Goal:** Mengelola pesanan catering/partai besar sebagai sumber pendapatan terpisah.

**Key Deliverables:**
- Backend API CRUD untuk CateringOrder dengan validasi status workflow (Pending → Confirmed → Done).
- Frontend form & list catering orders.
- Dashboard summary: total nilai catering, jumlah per status.
- Section Catering di E-Report (terpisah dari penjualan harian).
- Integrasi nominal catering ke total pendapatan E-Report.

**FRs Covered:** FR-014, FR-015

---

### Phase 6 — Reports
**Goal:** Menghasilkan dokumen formal pembukuan digital yang valid, bersih, dan siap cetak.

**Key Deliverables:**
- E-Report page dengan filter rentang tanggal (harian/mingguan/bulanan/kustom).
- Ringkasan laporan di layar: total pendapatan, total pengeluaran, laba/rugi, top menu, catering summary.
- Export PDF (jspdf + jspdf-autotable) dengan layout rapi.
- Export CSV (raw data) yang dapat dibuka di Excel.
- Validasi format tanggal & pesan error jika data tidak ditemukan.

**FRs Covered:** FR-005, FR-006, FR-008, FR-015 (E-Report section)

---

### Phase 7 — AI Integration
**Goal:** Memberikan wawasan bisnis otomatis dalam Bahasa Indonesia melalui Google Gemini.

**Key Deliverables:**
- Integrasi Google Gemini API (`@google/generative-ai`).
- Tombol "Ringkasan AI" di pojok kanan atas dashboard.
- Prompt engineering untuk ringkasan performa bisnis: tren omset, menu terlaris, pengeluaran, laba/rugi, catering.
- Rekomendasi bisnis singkat dari AI.
- Loading indicator saat menunggu respons.
- Pesan error informatif jika API tidak tersedia / quota habis (tidak crash dashboard).

**FRs Covered:** FR-011

---

### Phase 8 — QA & Deployment
**Goal:** Memastikan kualitas, keamanan, dan ketersediaan sistem sebelum soft launch.

**Key Deliverables:**
- Unit & integration tests (Vitest + Supertest).
- Load testing (k6) untuk 50 transaksi bersamaan.
- Lighthouse audit (page load ≤ 4s, bundle ≤ 800KB).
- Security review: JWT secret, CORS, rate limiting, input sanitization.
- UAT oleh pemilik resto (workflow lengkap dari login hingga export laporan).
- Deployment ke production (Railway/Render) dengan PostgreSQL.
- Health check monitoring & rollback plan.

**FRs Covered:** NFR-9.1 – NFR-9.6

---

## Dependency Graph

```
Phase 1 (Foundation)
    │
    ├──► Phase 2 (Dashboard)
    │       │
    │       ├──► Phase 3 (Data Management) ──► Phase 4 (Financial)
    │       │                                    │
    │       │                                    ├──► Phase 5 (Catering)
    │       │                                    │       │
    │       │                                    │       └──► Phase 6 (Reports)
    │       │                                    │               │
    │       │                                    │               └──► Phase 7 (AI)
    │       │                                    │                       │
    │       │                                    │                       └──► Phase 8 (QA & Deploy)
    │       │                                    │
    │       └──► Phase 8 (QA & Deploy) ◄─────────┘
```

**Catatan:** Dashboard (Phase 2) bisa dikerjakan paralel dengan Data Management (Phase 3) karena keduanya berbagi fondasi yang sama, namun dashboard membutuhkan data management agar dapat didemokan secara utuh.

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Keterlambatan integrasi Gemini API | Medium | Implementasi mock service untuk AI summary agar UI tetap berfungsi tanpa API. |
| Kinerja bundle frontend > 800KB | Medium | Code splitting (lazy load E-Report, AI module), tree shaking, gzip/brotli. |
| Inkonsistensi data saat reset/simulasi | High | Gunakan transaksi Prisma (`$transaction`) untuk operasi bulk delete/insert. |
| Kegagalan ekspor PDF di browser lama | Low | Fallback ke CSV; validasi browser capabilities. |
| UAT menemukan UX yang tidak intuitif | Medium | Prototype cepat di Phase 2, iterasi berdasarkan feedback sebelum Phase 8. |

---

*End of Document*
