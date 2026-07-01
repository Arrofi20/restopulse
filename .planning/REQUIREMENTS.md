# Requirements

## Functional Requirements (FR)

| FR ID | Requirement | Actor | Priority | MoSCoW | Phase |
|-------|-------------|-------|----------|--------|-------|
| FR-001 | Mengizinkan pemilik masuk ke dalam sistem menggunakan akun (username & password) yang terdaftar | System | Critical | **M** | Phase 1 |
| FR-002 | Memvalidasi hak akses login dan mengarahkan pemilik ke halaman Dasbor Utama (Dashboard) | System | Critical | **M** | Phase 1 |
| FR-003 | Mengagregasikan data omset dan performa menu dari database, lalu menggambar Line Chart interaktif riwayat harian dan Pie Chart menu terlaris secara otomatis | System | Critical | **M** | Phase 2 |
| FR-004 | Men-generate dan menyuntikkan ratusan baris data transaksi fiktif harian masa lalu secara berurutan ke database melalui tombol "Suntik Data Simulasi" | Owner | Critical | **M** | Phase 3 |
| FR-005 | Menyaring, menghitung total pendapatan, dan menyusun lembar ringkasan laporan digital (E-Report) di layar sesuai filter pemilik | System | Critical | **M** | Phase 6 |
| FR-006 | Mengonversi struktur data laporan di layar menjadi file dokumen digital siap cetak berformat PDF | System | High | **S** | Phase 6 |
| FR-007 | Menampilkan pop-up detail (tooltip) berisi nominal angka omset dan menu terlaris secara instan ketika titik tanggal pada grafik disentuh | System | High | **S** | Phase 2 |
| FR-008 | Mengekstrak data mentah ringkasan penjualan harian ke dalam format lembar kerja spreadsheet berupa file CSV | System | Medium | **C** | Phase 6 |
| FR-009 | Memasukkan data transaksi harian baru secara manual melalui formulir yang disediakan (Tanggal, Omset, Menu Terlaris) | Owner | Medium | **C** | Phase 3 |
| FR-010 | Mengirimkan notifikasi ringkasan performa penjualan mingguan otomatis langsung ke nomor WhatsApp pemilik | System | Low | **W** | Future |
| FR-011 | Menampilkan ringkasan otomatis seluruh performa bisnis dalam Bahasa Indonesia menggunakan Google Gemini AI, mencakup tren omset harian, menu terlaris, pengeluaran bulanan, laba/rugi, dan pesanan catering, beserta rekomendasi bisnis singkat | System | High | **S** | Phase 7 |
| FR-012 | Memasukkan data pengeluaran bulanan secara manual melalui formulir di halaman Input Data (Kategori, Nominal, Bulan, Tahun) | Owner | High | **S** | Phase 3 / 4 |
| FR-013 | Menampilkan perbandingan total pemasukan vs total pengeluaran bulanan dalam bentuk kartu ringkasan laba/rugi di dashboard | System | High | **S** | Phase 4 |
| FR-014 | Memasukkan data pesanan catering/partai besar secara manual melalui formulir di halaman Input Data (Nama Klien, Tanggal, Nominal, Status: Pending/Confirmed/Done, Catatan) | Owner | Medium | **C** | Phase 3 / 5 |
| FR-015 | Menampilkan ringkasan data pesanan catering di dashboard (total nilai, jumlah pesanan per status) dan di E-Report sebagai section terpisah dari penjualan harian | System | Medium | **C** | Phase 5 / 6 |

## Non-Functional Requirements (NFR)

| ID | Requirement | Target | Phase |
|----|-------------|--------|-------|
| NFR-9.1 | Pembaruan data di dasbor pemilik harus terrefleksi dalam waktu ≤ 3 detik setelah perubahan terjadi di database | ≤ 3 detik | Phase 2 / 8 |
| NFR-9.2 | Sistem harus mempertahankan uptime minimum 99,5% selama jam operasional restoran | ≥ 99,5% | Phase 8 |
| NFR-9.3 | Halaman dasbor pemilik harus dapat dimuat dalam waktu ≤ 4 detik pada koneksi 4G standar. Total page weight tidak boleh melebihi 800 KB | ≤ 4 detik, ≤ 800 KB | Phase 2 / 8 |
| NFR-9.4 | Sistem v1 harus mampu menangani minimal 50 entri transaksi bersamaan tanpa degradasi performa (response time API ≤ 500ms) | ≤ 500ms | Phase 8 |
| NFR-9.5 | Setiap perubahan data omset harus dicatat di StatusLog secara atomik bersama perubahan di tabel DailySales. Hal yang sama berlaku untuk data pengeluaran (MonthlyExpense) dan pesanan catering (CateringOrder) | Atomic transaction | Phase 1 / 3 / 4 / 5 |
| NFR-9.6 | Fitur Ringkasan AI (FR-011) bergantung pada ketersediaan Google Gemini API. Sistem wajib menampilkan pesan error yang informatif jika API tidak tersedia atau quota habis, tanpa menyebabkan crash atau gangguan pada fitur lain di dashboard | Graceful degradation | Phase 7 |

## Data Management Module Requirements

### 1. Reset Data
- Dedicated button dengan confirmation dialog
- Warning bahwa data tidak dapat dipulihkan
- Menghapus: Sales, Expenses, Catering, Reports, Analytics cache, Simulation data
- Refresh dashboard automatically
- Display success notification

### 2. Run Simulation
- Select number of days (max 365) & optional start date
- Generate realistic historical data: random revenue, random menu sales, random expenses, random catering orders
- Automatically regenerate analytics
- Replace existing simulation only after explicit confirmation (PRD Edge Case)
- Data harus terlihat realistis, tidak purely random

### 3. Manual Data Entry
- **Daily Sales:** Date, Revenue, Best-selling Menu
- **Monthly Expenses:** Category, Amount, Month, Year
- **Catering Orders:** Client, Date, Amount, Status (Pending/Confirmed/Done), Notes

## Traceability

| Requirement | Phase |
|-------------|-------|
| FR-001, FR-002 | Phase 1 |
| FR-003, FR-007 | Phase 2 |
| FR-004, FR-009, FR-012, FR-014, Reset Data, Run Simulation, Manual Data Entry | Phase 3 |
| FR-012, FR-013 | Phase 4 |
| FR-014, FR-015 | Phase 5 |
| FR-005, FR-006, FR-008, FR-015 (E-Report section) | Phase 6 |
| FR-011 | Phase 7 |
| NFR-9.1 – NFR-9.6 | Phase 8 |

---
*Last updated: 2026-06-29 after PRD refresh*
