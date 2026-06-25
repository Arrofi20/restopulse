# OpenCode Configuration: RestoPulse
# Ref: RestoPulse - Nasi Durian - PRD (v1.0)

## 1. Project Overview
- **Nama:** RestoPulse
- **Tujuan:** Dashboard terintegrasi untuk pemilik restoran guna memantau data historis, omset, dan laporan bisnis secara efisien.
- **Aktor:** Pemilik/Manajer Restoran (Single-outlet).
- **Goal:** Agregasi data otomatis, visualisasi interaktif, dan E-Report.

## 2. Requirement Scope (FR-001 - FR-010)
- **Must Have (Prioritas Utama):** 
  - FR-001 (Login Auth), FR-002 (Access Control)
  - FR-003 (Dashboard Agregasi: Line Chart & Pie Chart)
  - FR-004 (Dummy Injector Data)
  - FR-005 (E-Report Filter Tanggal)
- **Should Have:** FR-006 (Export PDF), FR-007 (Tooltip Interaktif)
- **Could Have:** FR-008 (Export CSV), FR-009 (Manual Input Form)
- **Won't Have (v1):** FR-010 (WhatsApp Notif)

## 3. Non-Functional Requirements (NFR)
- **Pembaruan Dasbor:** ≤ 3 detik (9.1)
- **Uptime:** ≥ 99,5% (9.2)
- **Page Load:** ≤ 4 detik (max 800KB) (9.3)
- **API Latency:** ≤ 500ms (untuk 50 transaksi bersamaan) (9.4)
- **Data Integrity:** Pencatatan atomik omset di StatusLog (9.5)

## 4. Development Roadmap (Milestones)
- **Phase 1 (Rofi):** Setup Database (5 entitas Section 8), API Core, & Auth.
- **Phase 2 (Nadiv):** Frontend Dashboard (Line Chart, Pie Chart, Tooltip).
- **Phase 3 (Orian):** Owner Dashboard & E-Report (PDF/CSV, Injector, Form Manual).
- **Phase 4 (Cahya):** QA, Performance Testing, & UAT (NFR 9.1–9.5).
- **Phase 5 (Rofi):** Deployment (Render) & Soft Launch.

## 5. Constraint & Aturan Coding
- **Backend:** Express.js, Prisma, PostgreSQL (dev.db).
- **Frontend:** React, Vite, Chart.js.
- **Design UI:** Font min 24pt (data finansial), Background gelap, Teks putih/kuning, Indikator warning merah untuk penurunan omset.
- **Data Policy:** Data finansial bersifat immutable (tidak bisa diedit setelah report di-generate).
- **Git Flow:** Gunakan Git Worktree per Milestone. PR wajib di-review tim sebelum merge ke main.