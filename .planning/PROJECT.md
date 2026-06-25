# RestoPulse

## What This Is

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran skala kecil-menengah. Sistem mengubah data penjualan harian menjadi grafik interaktif (tren omset dan menu terlaris) serta menghasilkan dokumen laporan keuangan digital yang siap unduh dan cetak, menghilangkan kebutuhan rekapitulasi manual yang rentan kesalahan.

## Core Value

Pemilik restoran dapat langsung melihat tren pendapatan harian dan menu paling laku, serta menghasilkan laporan keuangan akurat dalam hitungan detik — tanpa perlu menghabiskan berjam-jam untuk rekapitulasi buku kas atau nota fisik.

## Business Context

- **Customer**: Pemilik restoran F&B skala kecil-menengah di Indonesia
- **Revenue model**: Sistem proyek akademik/internal (tidak dimonetisasi langsung)
- **Success metric**: 100% ketersediaan laporan otomatis, 100% akurasi visualisasi tren, ≥98% tingkat keberhasilan ekspor dokumen
- **Strategy notes**: MVP v1 harus selesai dalam 8 minggu sejak kickoff; fokus pada single-outlet

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Sistem autentikasi login pemilik (username & password) dengan akses aman ke data finansial
- [ ] Dasbor utama dengan Line Chart riwayat tren omset harian yang interaktif
- [ ] Dasbor utama dengan Pie Chart persentase menu terlaris
- [ ] Tooltip interaktif pada grafik yang menampilkan detail omset dan menu saat titik tanggal disentuh
- [ ] Mesin E-Report dinamis dengan penyaringan data berdasarkan rentang tanggal (harian, mingguan, bulanan)
- [ ] Ekspor laporan ke format PDF siap cetak
- [ ] Ekspor data mentah ke format CSV (Excel)
- [ ] Formulir input data transaksi harian manual (Tanggal, Omset, Menu Terlaris)
- [ ] Generator data simulasi (dummy injector) untuk keperluan demo sistem
- [ ] Update data di dasbor dalam waktu ≤3 detik setelah input

### Out of Scope

- Aplikasi pelanggan & menu digital QR Code — bukan fokus manajerial pemilik
- Sistem antrean & layar dapur (KDS) — kompleksitas di luar MVP
- Manajemen inventaris & stok gudang — ditangguhkan ke versi selanjutnya
- Integrasi gerbang pembayaran (GoPay, OVO, DANA, transfer bank) — tidak ada transaksi dalam aplikasi
- Manajemen multi-outlet / multi-cabang — v1 didesain khusus single-outlet
- Sistem loyalitas & membership — tidak ada interaksi dengan konsumen
- Ulasan, rating menu, & feedback pelanggan — tidak ada interaksi sistem dengan konsumen
- Notifikasi WhatsApp otomatis — Won't Have untuk v1 (FR-010)

## Context

- Proyek tim "Nasi Durian": Orian Edsel Devanindra, Aimar Nadiv Ramazahran, Aprilia Cahyanti
- Product Owner: Muhammad Abdurrohman Arrofi
- Target demo: Pemilik restoran dengan data simulasi yang menunjukkan visualisasi interaktif
- Pengguna diasumsikan memiliki pemahaman dasar pengoperasian aplikasi web (navigasi, formulir, unduh file)
- Koneksi internet stabil diperlukan untuk memuat pustaka grafik dan ekspor dokumen

## Constraints

- **Timeline**: MVP v1 harus selesai dikembangkan dalam 8 minggu sejak kickoff
- **Architecture**: Single-outlet only; struktur database tidak mengakomodasi multi-tenant/multi-cabang
- **Security**: Akses ke dasbor analitik dan E-Report wajib dilindungi autentikasi ketat karena data finansial sensitif
- **Format File**: E-Report hanya mendukung PDF dan CSV; tidak mengakomodasi .docx atau .txt
- **Browser**: Wajib menggunakan browser modern (Chrome/Safari/Firefox)
- **Performance**: Halaman dasbor ≤4 detik pada koneksi 4G; update data ≤3 detik; page weight ≤800 KB

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-based dashboard (bukan mobile app) | Akses fleksibel via laptop/tablet/smartphone tanpa perlu installasi; cocok untuk pemilik restoran | — Pending |
| Manual data entry + dummy injector untuk MVP | Tidak ada integrasi POS real-time yang tersedia; dummy injector memungkinkan demo tanpa data riil | — Pending |
| Chart.js untuk visualisasi | Pustaka JavaScript yang matang, ringan, dan mendukung interaktivitas tooltip out-of-the-box | — Pending |
| Single-outlet constraint untuk v1 | Mempercepat pengembangan MVP dan menghindari kompleksitas multi-tenant | — Pending |
| PDF + CSV untuk ekspor laporan | Format paling umum untuk arsip internal dan evaluasi bisnis; mudah dicetak atau diolah lebih lanjut | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-25 after initialization*
