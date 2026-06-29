# RestoPulse

## What This Is

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran skala kecil-menengah. Sistem mengubah data penjualan harian menjadi grafik interaktif (tren omset dan menu terlaris) serta menghasilkan dokumen laporan keuangan digital yang siap unduh dan cetak, menghilangkan kebutuhan rekapitulasi manual yang rentan kesalahan.

**Shipped v1.0:** Dasbor interaktif dengan Line Chart + Pie Chart, E-Report dengan PDF/CSV export, autentikasi JWT, dummy data injector, dan deployment-ready setup untuk Render.com.

## Core Value

Pemilik restoran dapat langsung melihat tren pendapatan harian dan menu paling laku, serta menghasilkan laporan keuangan akurat dalam hitungan detik — tanpa perlu menghabiskan berjam-jam untuk rekapitulasi buku kas atau nota fisik.

## Business Context

- **Customer**: Pemilik restoran F&B skala kecil-menengah di Indonesia
- **Revenue model**: Sistem proyek akademik/internal (tidak dimonetisasi langsung)
- **Success metric**: 100% ketersediaan laporan otomatis, 100% akurasi visualisasi tren, ≥98% tingkat keberhasilan ekspor dokumen
- **Strategy notes**: MVP v1 selesai dalam ~2 hari pengembangan intensif; fokus pada single-outlet

## Requirements

### Validated (v1.0)

- ✓ Sistem autentikasi login pemilik (username & password) dengan akses aman ke data finansial — v1.0
- ✓ Dasbor utama dengan Line Chart riwayat tren omset harian yang interaktif — v1.0
- ✓ Dasbor utama dengan Pie Chart persentase menu terlaris — v1.0
- ✓ Tooltip interaktif pada grafik yang menampilkan detail omset dan menu saat titik tanggal disentuh — v1.0
- ✓ Mesin E-Report dinamis dengan penyaringan data berdasarkan rentang tanggal (harian, mingguan, bulanan) — v1.0
- ✓ Ekspor laporan ke format PDF siap cetak — v1.0
- ✓ Ekspor data mentah ke format CSV (Excel) — v1.0
- ✓ Formulir input data transaksi harian manual (Tanggal, Omset, Menu Terlaris) — v1.0
- ✓ Generator data simulasi (dummy injector) untuk keperluan demo sistem — v1.0
- ✓ Update data di dasbor dalam waktu ≤3 detik setelah input — v1.0

### Active (Next Milestone)

- [ ] Notifikasi WhatsApp mingguan otomatis (NOTF-01)
- [ ] AI Ringkasan Otomatis performa penjualan (AI-01)
- [ ] Manajemen multi-outlet / multi-cabang
- [ ] Sistem loyalitas & membership
- [ ] Integrasi POS real-time

### Out of Scope

- Aplikasi pelanggan & menu digital QR Code — bukan fokus manajerial pemilik
- Sistem antrean & layar dapur (KDS) — kompleksitas di luar MVP
- Manajemen inventaris & stok gudang — ditangguhkan ke versi selanjutnya
- Integrasi gerbang pembayaran (GoPay, OVO, DANA, transfer bank) — tidak ada transaksi dalam aplikasi
- Ulasan, rating menu, & feedback pelanggan — tidak ada interaksi sistem dengan konsumen
- Real-time POS integration — memerlukan hardware dan protokol integrasi eksternal

## Context

- Proyek tim "Nasi Durian": Orian Edsel Devanindra, Aimar Nadiv Ramazahran, Aprilia Cahyanti
- Product Owner: Muhammad Abdurrohman Arrofi
- Target demo: Pemilik restoran dengan data simulasi yang menunjukkan visualisasi interaktif
- Pengguna diasumsikan memiliki pemahaman dasar pengoperasian aplikasi web
- Koneksi internet stabil diperlukan untuk memuat pustaka grafik dan ekspor dokumen
- **Current codebase:** ~5,000+ LOC TypeScript (backend + frontend), 121 git commits
- **Tech stack:** Node.js + Express + Prisma 7 + SQLite/PostgreSQL + React 19 + Vite + Tailwind v4 + Chart.js

## Constraints

- **Timeline**: MVP v1 selesai dalam waktu singkat (2 hari aktif)
- **Architecture**: Single-outlet only; struktur database tidak mengakomodasi multi-tenant/multi-cabang
- **Security**: Akses ke dasbor analitik dan E-Report wajib dilindungi autentikasi ketat karena data finansial sensitif
- **Format File**: E-Report mendukung PDF dan CSV; tidak mengakomodasi .docx atau .txt
- **Browser**: Wajib menggunakan browser modern (Chrome/Safari/Firefox)
- **Performance**: Halaman dasbor ≤4 detik pada koneksi 4G; update data ≤3 detik; page weight ≤800 KB

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-based dashboard (bukan mobile app) | Akses fleksibel via laptop/tablet/smartphone tanpa perlu installasi; cocok untuk pemilik restoran | ✓ Good — responsive design bekerja baik di 320-1440px |
| Manual data entry + dummy injector untuk MVP | Tidak ada integrasi POS real-time yang tersedia; dummy injector memungkinkan demo tanpa data riil | ✓ Good — data simulasi 365 hari berfungsi untuk demo |
| Chart.js untuk visualisasi | Pustaka JavaScript yang matang, ringan, dan mendukung interaktivitas tooltip out-of-the-box | ✓ Good — 451KB bundle, tooltip berfungsi dengan baik |
| Single-outlet constraint untuk v1 | Mempercepat pengembangan MVP dan menghindari kompleksitas multi-tenant | ✓ Good — fokus jelas, database simple |
| PDF + CSV untuk ekspor laporan | Format paling umum untuk arsip internal dan evaluasi bisnis; mudah dicetak atau diolah lebih lanjut | ✓ Good — PDF siap cetak, CSV Excel-compatible |
| Render.com hosting | Free-tier Web Service + PostgreSQL + Static Site, deployment simple | ✓ Good — render.yaml blueprint siap |
| SQLite local dev, PostgreSQL production | Env-based Prisma datasource, zero-config local dev | ✓ Good — dev/prod parity dengan provider switch |
| Prisma 7 adapter-based config | Prisma 7.8.0 memerlukan adapter untuk SQLite | ⚠️ Revisit — complexity yang bisa dihindari dengan Prisma 6 |
| Google Gemini API untuk AI Analytics | Model AI Google yang mendukung Bahasa Indonesia untuk generate ringkasan performa otomatis | 📋 Planned — diimplementasikan di Phase 5 (plan 05-05) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**v1.0 milestone (2026-06-27):**
- All v1 requirements moved to Validated
- REPT-03 (CSV export) unexpectedly delivered in v1.0 (originally v2)
- Notifikasi WhatsApp tetap Out of Scope untuk v1, dipromosikan ke Active untuk v1.1
- Multi-outlet dipromosikan dari Out of Scope ke Active untuk v1.1

---
*Last updated: 2026-06-27 after v1.0 milestone*
