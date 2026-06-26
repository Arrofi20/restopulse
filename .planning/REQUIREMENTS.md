# Requirements: RestoPulse

**Defined:** 2026-06-25
**Core Value:** Pemilik restoran dapat langsung melihat tren pendapatan harian dan menu paling laku, serta menghasilkan laporan keuangan akurat dalam hitungan detik — tanpa perlu menghabiskan berjam-jam untuk rekapitulasi buku kas atau nota fisik.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User dapat masuk ke sistem menggunakan akun (username & password) yang terdaftar
- [ ] **AUTH-02**: Sistem memvalidasi hak akses login dan mengarahkan pemilik ke halaman Dasbor Utama

### Dashboard Analytics

- [x] **DASH-01**: Sistem mengagregasikan data omset dan menggambar Line Chart interaktif riwayat tren harian secara otomatis saat halaman dasbor dimuat
- [x] **DASH-02**: Sistem mengagregasikan data performa menu dan menggambar Pie Chart persentase menu terlaris secara otomatis
- [x] **DASH-03**: Sistem menampilkan pop-up detail (tooltip) berisi nominal angka omset dan menu terlaris secara instan ketika titik tanggal pada grafik disentuh

### Data Entry & Simulation

- [ ] **DATA-01**: Pemilik/pengembang dapat menyuntikkan ratusan baris data transaksi fiktif harian masa lalu secara berurutan ke database melalui tombol "Suntik Data Simulasi"
- [ ] **DATA-02**: Pemilik dapat memasukkan data transaksi harian baru secara manual melalui formulir (Tanggal, Omset, Menu Terlaris)

### E-Report & Export

- [x] **REPT-01**: Sistem menyaring, menghitung total pendapatan, dan menyusun lembar ringkasan laporan digital di layar sesuai filter rentang tanggal pemilik
- [ ] **REPT-02**: Sistem mengonversi struktur data laporan di layar menjadi file dokumen digital siap cetak berformat PDF

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### E-Report & Export

- **REPT-03**: Sistem mengekstrak data mentah ringkasan penjualan harian ke dalam format file CSV (Excel)

### Notifications

- **NOTF-01**: Sistem mengirimkan notifikasi ringkasan performa penjualan mingguan otomatis langsung ke nomor WhatsApp pemilik setiap hari Minggu jam 21.00 WIB

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Aplikasi pelanggan & menu digital QR Code | Bukan fokus manajerial pemilik; kompleksitas di luar MVP |
| Sistem antrean & layar dapur (KDS) | Kompleksitas operasional dapur di luar cakupan analitik |
| Manajemen inventaris & stok gudang | Ditangguhkan ke versi selanjutnya; memerlukan entitas data tambahan |
| Integrasi gerbang pembayaran (e-wallet/transfer) | Tidak ada transaksi dalam aplikasi; scope independen |
| Manajemen multi-outlet / multi-cabang | v1 didesain khusus single-outlet; struktur DB tidak mengakomodasi multi-tenant |
| Sistem loyalitas & membership | Tidak ada interaksi sistem dengan konsumen |
| Ulasan, rating menu, & feedback pelanggan | Tidak ada interaksi sistem dengan konsumen |
| Real-time POS integration | Memerlukan hardware dan protokol integrasi eksternal; di luar timeline 8 minggu |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 2 | Complete |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| REPT-01 | Phase 3 | Complete |
| REPT-02 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-25*
*Last updated: 2026-06-25 after initial definition*
