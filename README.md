# RestoPulse — Panduan Singkat untuk Pemilik Restoran

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran. Sistem ini mengubah data penjualan harian menjadi grafik interaktif, mencatat pengeluaran bulanan dan pesanan catering, menghasilkan laporan keuangan digital siap cetak, serta memberikan ringkasan bisnis otomatis berbasis AI.

## Cara Login

Buka URL aplikasi RestoPulse di browser Anda. Pada halaman login, masukkan username dan password yang telah didaftarkan sebelumnya. Klik tombol **Login**, dan Anda akan diarahkan secara otomatis ke halaman Dasbor Utama. Jika belum memiliki akun, Anda dapat mendaftar melalui halaman register.

## Melihat Dasbor

Setelah login, Anda akan masuk ke halaman **Dasbor Utama** yang menampilkan:

- **Kartu Ringkasan**: Total Omset, Hari Tercatat, Rata-rata Harian, Total Pengeluaran
- **Kartu Laba/Rugi**: Selisih pemasukan dikurangi pengeluaran (hijau/kuning = untung, merah = rugi)
- **Ringkasan Catering**: Total nilai dan jumlah pesanan per status
- **Line Chart Tren Omset Harian** — sentuh titik grafik untuk melihat tooltip detail
- **Pie Chart Menu Terlaris** — persentase kontribusi setiap menu

Di pojok kanan atas, gunakan tombol **Ringkasan AI** untuk mendapatkan analisis bisnis otomatis dalam Bahasa Indonesia oleh Google Gemini AI.

Gunakan filter tanggal (7 Hari / 30 Hari / 90 Hari / Custom) di bagian atas dasbor.

## Data Management

Buka **Data Management** melalui sidebar untuk mengelola data restoran:

### Run Simulation
Generate data historis realistis untuk demonstrasi. Tentukan jumlah hari dan tanggal mulai. Mencakup revenue harian, menu sales, pengeluaran bulanan, dan pesanan catering. Jika data simulasi sudah ada, sistem akan meminta konfirmasi sebelum mengganti.

### Manual Entry
Tiga tab untuk entri manual:
- **Daily Sales**: Tanggal, Omset, Best-selling Menu
- **Monthly Expenses**: Kategori (Bahan Baku/Gaji/Operasional/Lainnya), Nominal, Bulan, Tahun
- **Catering Orders**: Nama Klien, Tanggal, Nominal, Status (Pending/Confirmed/Done), Catatan

### Reset Data
Menghapus semua data transaksional. Memerlukan konfirmasi dua tingkat. Data yang dihapus tidak dapat dipulihkan.

## Catering Management

Buka **Catering** melalui sidebar untuk melihat dan mengelola semua pesanan catering. Tabel menampilkan nama klien, tanggal, nominal, status, dan catatan. Status hanya bisa maju: Pending → Confirmed → Done. Cari klien berdasarkan nama dan filter berdasarkan status.

## E-Report

Buka **E-Report** melalui sidebar untuk menghasilkan laporan keuangan. Pilih rentang tanggal (Harian/Mingguan/Bulanan/Custom). Laporan menampilkan:

- **Ringkasan Penjualan**: Total Omset, Hari Tercatat, Total Pengeluaran, Laba/Rugi, Menu Terlaris
- **Detail Penjualan Harian**: Tabel per hari
- **Ringkasan Keuangan**: Pengeluaran per kategori dan laba/rugi
- **Ringkasan Catering**: Revenue catering dan pesanan per status

Klik **Export PDF** untuk mengunduh laporan siap cetak, atau **Export CSV** untuk data mentah yang dapat dibuka di Excel.

## AI Business Summary

Klik tombol **Ringkasan AI** di dashboard untuk mendapatkan analisis otomatis performa bisnis dalam Bahasa Indonesia. Ringkasan mencakup: analisis pendapatan, analisis pengeluaran, analisis catering, rekomendasi bisnis, dan potensi risiko.

Jika Gemini API tidak tersedia, sistem menampilkan ringkasan demo dan dashboard tetap berfungsi normal.

## Verifikasi Deployment

```bash
# Health check
curl -s https://<backend-url>/health

# Response: {"status":"ok","timestamp":"...","version":"1.1.0","environment":"production"}

# Register
curl -s -X POST https://<backend-url>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"demo_pass123"}'
```

Ganti `<backend-url>` dengan URL backend RestoPulse Anda (contoh: `https://restopulse-api.up.railway.app`).

---

*Panduan ini ditulis untuk pemilik restoran. Untuk dokumentasi teknis, lihat `implementation-plan.md`.*
