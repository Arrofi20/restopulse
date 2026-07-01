# RestoPulse

## What This Is

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran skala kecil-menengah. Sistem mengubah data penjualan harian menjadi grafik interaktif (tren omset dan menu terlaris), mencatat pengeluaran bulanan dan pesanan catering, serta menghasilkan dokumen laporan keuangan digital yang siap unduh dan cetak — menghilangkan kebutuhan rekapitulasi manual yang rentan kesalahan.

**Current Version:** v1.0 MVP (shipped 2026-06-27)  
**Next Target:** v1.1 — Financial Module, Catering Module, Redesigned Data Management, AI Integration (6–7 minggu)

## Core Value

Pemilik restoran dapat langsung melihat tren pendapatan harian, menu paling laku, kesehatan finansial (laba/rugi), dan status pesanan catering — serta menghasilkan laporan keuangan akurat dalam hitungan detik tanpa perlu rekapitulasi manual.

## Business Context

- **Customer**: Pemilik restoran F&B skala kecil-menengah di Indonesia
- **Revenue model**: Sistem proyek akademik/internal (tidak dimonetisasi langsung)
- **Success metric**: 100% ketersediaan laporan otomatis, 100% akurasi visualisasi tren, ≥98% tingkat keberhasilan ekspor dokumen, 100% pencatatan pengeluaran & catering
- **Strategy notes**: v1.1 menambahkan Financial, Catering, AI, dan Data Management yang didesain ulang; fokus pada single-outlet

## Requirements

### Validated (v1.0 — 2026-06-27)

- ✓ Sistem autentikasi login pemilik (username & password) dengan akses aman ke data finansial
- ✓ Dasbor utama dengan Line Chart riwayat tren omset harian yang interaktif
- ✓ Dasbor utama dengan Pie Chart persentase menu terlaris
- ✓ Tooltip interaktif pada grafik yang menampilkan detail omset dan menu saat titik tanggal disentuh
- ✓ Mesin E-Report dinamis dengan penyaringan data berdasarkan rentang tanggal (harian, mingguan, bulanan)
- ✓ Ekspor laporan ke format PDF siap cetak
- ✓ Ekspor data mentah ke format CSV (Excel)
- ✓ Formulir input data transaksi harian manual (Tanggal, Omset, Menu Terlaris)
- ✓ Generator data simulasi (dummy injector) untuk keperluan demo sistem
- ✓ Update data di dasbor dalam waktu ≤3 detik setelah input

### Active (v1.1 — Based on Latest PRD)

- [ ] **Data Management Module (Redesigned)** — Reset Data, Run Simulation, Manual Data Entry (Daily Sales, Monthly Expenses, Catering Orders)
- [ ] **Financial Module** — Pencatatan pengeluaran bulanan per kategori (Bahan Baku, Gaji, Operasional, Lainnya), kalkulasi laba/rugi, kartu ringkasan finansial di dashboard
- [ ] **Catering Module** — CRUD pesanan catering/partai besar dengan status Pending → Confirmed → Done, ringkasan catering di dashboard, section catering di E-Report
- [ ] **AI Integration** — Ringkasan otomatis performa bisnis dalam Bahasa Indonesia via Google Gemini API, rekomendasi bisnis singkat, loading state, graceful error handling
- [ ] **Dashboard Enhancements** — Auto-refresh, KPI cards (revenue, profit/loss, catering), tooltip interaction

### Future / Out of Scope (v1.1+)

- Notifikasi WhatsApp mingguan otomatis (FR-010) — deferred
- Manajemen multi-outlet / multi-cabang — v2
- Sistem loyalitas & membership — v2
- Integrasi POS real-time — v2
- Aplikasi pelanggan & menu digital QR Code — v2
- Sistem antrean & layar dapur (KDS) — v2
- Manajemen inventaris & stok gudang — v2
- Integrasi gerbang pembayaran — v2
- Ulasan, rating menu, & feedback pelanggan — v2

## Context

- Proyek tim "Nasi Durian": Orian Edsel Devanindra, Aimar Nadiv Ramazahran, Aprilia Cahyanti
- Product Owner: Muhammad Abdurrohman Arrofi
- Target demo: Pemilik restoran dengan data simulasi yang menunjukkan visualisasi interaktif + laporan keuangan lengkap
- Pengguna diasumsikan memiliki pemahaman dasar pengoperasian aplikasi web
- Koneksi internet stabil diperlukan untuk memuat pustaka grafik, ekspor dokumen, dan AI summary
- **Current codebase:** ~5,000+ LOC TypeScript (backend + frontend), 121+ git commits
- **Tech stack:** Node.js + Express + Prisma 7 + SQLite/PostgreSQL + React 19 + Vite + Tailwind v4 + Chart.js + jspdf + Google Generative AI

## Constraints

- **Timeline**: v1.1 selesai dalam 6–7 minggu sejak kickoff (PRD Section 10)
- **Architecture**: Single-outlet only; struktur database tidak mengakomodasi multi-tenant/multi-cabang
- **Security**: Akses ke dasbor analitik dan E-Report wajib dilindungi autentikasi ketat karena data finansial sensitif
- **Format File**: E-Report mendukung PDF dan CSV; tidak mengakomodasi .docx atau .txt
- **Browser**: Wajib menggunakan browser modern (Chrome/Safari/Firefox)
- **Performance**: Halaman dasbor ≤4 detik pada koneksi 4G; update data ≤3 detik; page weight ≤800 KB; API latency ≤500ms untuk 50 transaksi bersamaan
- **Data Integrity**: Setiap perubahan data finansial wajib dicatat atomik di `StatusLog`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-based dashboard (bukan mobile app) | Akses fleksibel via laptop/tablet/smartphone tanpa perlu installasi; cocok untuk pemilik restoran | ✓ Good — responsive design bekerja baik di 320-1440px |
| Manual data entry + dummy injector untuk MVP | Tidak ada integrasi POS real-time yang tersedia; dummy injector memungkinkan demo tanpa data riil | ✓ Good — data simulasi 365 hari berfungsi untuk demo |
| Chart.js untuk visualisasi | Pustaka JavaScript yang matang, ringan, dan mendukung interaktivitas tooltip out-of-the-box | ✓ Good — 451KB bundle, tooltip berfungsi dengan baik |
| Single-outlet constraint untuk v1 | Mempercepat pengembangan MVP dan menghindari kompleksitas multi-tenant | ✓ Good — fokus jelas, database simple |
| PDF + CSV untuk ekspor laporan | Format paling umum untuk arsip internal dan evaluasi bisnis; mudah dicetak atau diolah lebih lanjut | ✓ Good — PDF siap cetak, CSV Excel-compatible |
| Railway/Render hosting | Free-tier Web Service + PostgreSQL + Static Site, deployment simple | ✓ Good — deployment-ready |
| SQLite local dev, PostgreSQL production | Env-based Prisma datasource, zero-config local dev | ✓ Good — dev/prod parity dengan provider switch |
| Prisma 7 adapter-based config | Prisma 7.8.0 memerlukan adapter untuk SQLite | ⚠️ Revisit — complexity yang bisa dihindari dengan Prisma 6 |
| Google Gemini API untuk AI Analytics | Model AI Google yang mendukung Bahasa Indonesia untuk generate ringkasan performa otomatis | 📋 Planned — diimplementasikan di Phase 7 |
| Data Management Module Redesign | Tiga aksi utama (Reset, Simulate, Manual Entry) di satu halaman untuk UX yang lebih bersih | 📋 Planned — diimplementasikan di Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**v1.0 milestone (2026-06-27):**
- All v1 requirements moved to Validated
- REPT-03 (CSV export) unexpectedly delivered in v1.0 (originally v2)

**v1.1 planning refresh (2026-06-29):**
- PRD diperbarui secara signifikan (Copy of PSI - Nasi Durian - PRD.docx)
- Ditambahkan: Financial Module, Catering Module, AI Integration, Data Management Redesign
- Roadmap direstruktur menjadi 8 fase (Foundation → Dashboard → Data Management → Financial → Catering → Reports → AI → QA & Deployment)
- Phase Reports (E-Report) tetap ada namun kini mencakup data pengeluaran & catering

---
*Last updated: 2026-06-29 after PRD refresh*
