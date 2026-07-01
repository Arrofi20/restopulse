# OpenCode Configuration: RestoPulse
# Ref: RestoPulse - Nasi Durian - PRD (v1.0, 29 Juni 2026)

## 1. Project Overview
- **Nama:** RestoPulse
- **Tujuan:** Dashboard terintegrasi untuk pemilik restoran guna memantau data historis, omset, pengeluaran, pesanan catering, dan laporan bisnis secara efisien.
- **Aktor:** Pemilik/Manajer Restoran (Single-outlet).
- **Goal:** Agregasi data otomatis, visualisasi interaktif, E-Report siap unduh, pencatatan keuangan & catering, serta ringkasan AI.

## 2. Requirement Scope (FR-001 - FR-015)
- **Must Have (MVP — Prioritas Utama):**
  - FR-001 (Login Auth), FR-002 (Access Control / Session Management)
  - FR-003 (Dashboard Agregasi: Line Chart & Pie Chart, Tooltip, Auto-refresh)
  - FR-004 (Dummy Injector / Run Simulation)
  - FR-005 (E-Report Filter Tanggal)
  - FR-009 (Manual Input Form — Daily Sales)
  - Reset Data (Data Management Module)
  - NFR-9.1 – NFR-9.5

- **Should Have:**
  - FR-006 (Export PDF)
  - FR-007 (Tooltip Interaktif)
  - FR-011 (AI Ringkasan Otomatis via Google Gemini)
  - FR-012 (Pencatatan Pengeluaran Bulanan)
  - FR-013 (Kartu Laba/Rugi)

- **Could Have:**
  - FR-008 (Export CSV)
  - FR-014 (Input Pesanan Catering)
  - FR-015 (Ringkasan Catering di Dashboard & E-Report)

- **Won't Have (v1):**
  - FR-010 (WhatsApp Notif)
  - Multi-outlet, POS integration, Inventory, QR Code, Loyalty, Review system

## 3. Non-Functional Requirements (NFR)
- **Pembaruan Dasbor:** ≤ 3 detik (9.1)
- **Uptime:** ≥ 99,5% (9.2)
- **Page Load:** ≤ 4 detik (max 800KB) (9.3)
- **API Latency:** ≤ 500ms (untuk 50 transaksi bersamaan) (9.4)
- **Data Integrity:** Pencatatan atomik di StatusLog untuk setiap perubahan finansial (9.5)
- **AI Availability:** Graceful degradation jika Gemini API tidak tersedia (9.6)

## 4. Development Roadmap (8 Phases)
- **Phase 1 (Minggu 1):** Setup Database (semua entitas Section 8 PRD), API Core, & Auth.
- **Phase 2 (Minggu 2):** Frontend Dashboard (Line Chart, Pie Chart, KPI Cards, Tooltip, Auto-refresh).
- **Phase 3 (Minggu 3):** Data Management Module — Reset Data, Run Simulation, Manual Data Entry.
- **Phase 4 (Minggu 4):** Financial Features — Monthly Expenses, Profit/Loss Card.
- **Phase 5 (Minggu 4–5):** Catering Module — CRUD, Dashboard Summary, E-Report Section.
- **Phase 6 (Minggu 5):** Reports — E-Report, PDF Export, CSV Export, Date Filtering.
- **Phase 7 (Minggu 6):** AI Integration — Google Gemini Business Summary & Recommendations.
- **Phase 8 (Minggu 6–7):** QA, Performance Testing, UAT, Security Audit, & Deployment (Railway).

## 5. Constraint & Aturan Coding
- **Backend:** Express.js, Prisma, PostgreSQL (production) / SQLite (dev).
- **Frontend:** React 19, Vite, Chart.js, Tailwind CSS v4.
- **Design UI:** Font min 24pt (data finansial), Background gelap, Teks putih/kuning, Indikator warning merah untuk penurunan omset / rugi.
- **Data Policy:** Data finansial bersifat immutable (tidak bisa diedit setelah report di-generate). Reset & simulasi dianggap operasi replace, bukan edit, dan memerlukan konfirmasi eksplisit.
- **Git Flow:** Gunakan Git Worktree per Milestone. PR wajib di-review tim sebelum merge ke main.

## 6. Planning Document Index
Dokumen perencanaan yang harus dijaga konsistensinya:
1. `planning.md` — Master scope & requirements.
2. `roadmap.md` — High-level product roadmap.
3. `development-roadmap.md` — Technical development roadmap.
4. `phases.md` — Detailed phase breakdown (8 phases).
5. `implementation-plan.md` — Technical architecture & API design.
6. `milestones.md` — Milestones dengan acceptance criteria & DoD.
7. `task-checklist.md` — Granular task breakdown.
8. `DEPLOYMENT.md` — Deployment guide & env vars.
