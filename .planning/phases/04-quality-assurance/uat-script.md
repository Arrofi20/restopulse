# Panduan UAT (User Acceptance Testing) — RestoPulse

**Fase:** Phase 4 — Quality Assurance
**Tanggal:** [diisi saat UAT]
**Peserta:** [nama pemilik restoran]
**Tujuan:** Memverifikasi seluruh fitur Must Have berfungsi sesuai kebutuhan pemilik restoran.

## Persiapan Sebelum UAT

1. Pastikan sistem sudah berjalan:
   - Backend: `npm run dev` (port 3000)
   - Frontend: `cd frontend && npm run dev` (port 5173)
2. Data simulasi sudah diinjeksi (minimal 30 hari data untuk demo yang realistis)
3. Akun uji: username `testuser`, password `testpass123`
4. Buka browser (Chrome/Safari/Firefox) dan akses http://localhost:5173

## Latar Belakang

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital untuk pemilik restoran. Sistem ini mengubah data penjualan harian menjadi grafik interaktif dan laporan keuangan digital.

Sebelum UAT, sistem telah melalui 4 fase audit:
- **04-01:** Pengujian API fungsional — 29 test case lulus
- **04-02:** Pengujian performa — load test 50 pengguna, audit kecepatan halaman
- **04-03:** Audit aksesibilitas — semua skor Lighthouse 100/100, target sentuh ≥44px
- **04-04:** Audit keamanan — JWT, injeksi SQL, kebocoran error terverifikasi aman

### Ringkasan Bug yang Sudah Diperbaiki Sebelum UAT

| ID | Severitas | Sumber | Deskripsi | Status |
|----|-----------|--------|-----------|--------|
| M-01 | Major | 04-03 | Touch target tombol hamburger <44px | ✅ Fixed |
| M-02 | Major | 04-03 | Touch target tombol tutup sidebar <44px | ✅ Fixed |
| M-03 | Major | 04-03 | Touch target tombol preset DateFilter <44px | ✅ Fixed |
| M-04 | Major | 04-03 | Touch target input tanggal DateFilter <44px | ✅ Fixed |
| M-05 | Major | 04-03 | Touch target item navigasi sidebar <44px | ✅ Fixed |
| M-06 | Major | 04-03 | Touch target tombol refresh <44px | ✅ Fixed |
| M-07 | Major | 04-03 | Touch target preset ReportDateFilter <44px | ✅ Fixed |
| B-01 | Major | 04-04 | Validasi input Zod di rute autentikasi | ✅ Fixed |

## Alur 1: Autentikasi (AUTH-01, AUTH-02)

### 1.1 Registrasi Akun Baru
- Buka halaman Login di http://localhost:5173/login
- Klik link "Belum punya akun? Daftar"
- Isi form: Nama Pengguna (misal: `pemilik1`), Kata Sandi (misal: `rahasia123`)
- Klik tombol "Daftar"
- **Diharapkan:** Sistem membuat akun baru dan mengarahkan ke halaman Dasbor

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 1.2 Registrasi dengan Data Tidak Lengkap
- Buka halaman Register
- Biarkan Nama Pengguna kosong, isi Kata Sandi
- Klik "Daftar"
- **Diharapkan:** Sistem menampilkan pesan error "Username harus diisi" atau "Password minimal 6 karakter"

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 1.3 Login dengan Kredensial Valid
- Buka halaman Login
- Masukkan username `testuser` dan password `testpass123`
- Klik tombol "Masuk"
- **Diharapkan:** Sistem memvalidasi kredensial dan mengarahkan ke Dasbor Utama
- **Diharapkan:** Header menampilkan nama outlet dan username pemilik

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 1.4 Login dengan Password Salah
- Masukkan username `testuser` dengan password yang SALAH
- Klik "Masuk"
- **Diharapkan:** Sistem menampilkan pesan error (teks merah), tidak mengarahkan ke dasbor

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 1.5 Registrasi dengan Username Sudah Ada
- Coba daftar dengan username `testuser` (yang sudah terdaftar)
- Klik "Daftar"
- **Diharapkan:** Sistem menampilkan pesan error "Username sudah digunakan"

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 1.6 Logout
- Dari halaman Dasbor, klik tombol "Keluar" di sidebar
- **Diharapkan:** Sistem mengeluarkan pengguna, kembali ke halaman Login
- **Diharapkan:** Jika mencoba akses http://localhost:5173/dashboard tanpa login, kembali ke halaman Login

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Alur 2: Dasbor Analitik (DASH-01, DASH-02, DASH-03)

### 2.1 Line Chart — Tren Omset Harian
- Setelah login, amati halaman Dasbor
- **Diharapkan:** Line Chart menampilkan riwayat omset harian yang runtut, dengan sumbu X (tanggal) dan sumbu Y (nilai Rupiah)
- **Diharapkan:** Warna grafik: kuning (amber-400) untuk kenaikan, merah (#ef4444) untuk penurunan

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.2 Pie Chart — Menu Terlaris
- Lihat bagian Pie Chart di bawah Line Chart
- **Diharapkan:** Pie Chart menampilkan persentase menu terlaris (top 10)
- **Diharapkan:** Setiap irisan pie memiliki warna berbeda dan label persentase

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.3 Tooltip Interaktif (DASH-03)
- Arahkan kursor ke titik pada Line Chart, atau sentuh titik pada perangkat sentuh
- **Diharapkan:** Muncul pop-up tooltip yang menampilkan TANGGAL dan NOMINAL OMSET (dalam Rupiah)
- Arahkan kursor ke irisan Pie Chart
- **Diharapkan:** Muncul pop-up yang menampilkan NAMA MENU, PERSENTASE, JUMLAH, dan TOTAL OMSET

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.4 Filter Tanggal — Preset
- Klik tombol preset: "7 Hari", "30 Hari", "Bulan Ini", "Semua"
- **Diharapkan:** Grafik dan ringkasan berubah sesuai periode yang dipilih
- **Diharapkan:** Tombol preset yang aktif memiliki highlight kuning (amber-400)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.5 Filter Tanggal — Kustom
- Pilih rentang tanggal kustom: isi Tanggal Mulai dan Tanggal Akhir
- **Diharapkan:** Data sesuai rentang tanggal yang dipilih
- **Diharapkan:** Format tanggal YYYY-MM-DD

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.6 Kartu Ringkasan (Summary Cards)
- Amati kartu ringkasan: "Total Omset" dan "Jumlah Transaksi"
- **Diharapkan:** Nilai Total Omset dalam Rupiah (contoh: "Rp 1.234.567"), nilai Jumlah Transaksi dalam angka
- **Diharapkan:** Nilai berubah sesuai filter tanggal yang dipilih
- **Diharapkan:** Font nilai finansial besar (text-3xl, ≥24pt)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 2.7 Tombol Refresh
- Klik tombol Refresh (ikon 🔄) di dekat filter tanggal
- **Diharapkan:** Data grafik dan ringkasan dimuat ulang
- **Diharapkan:** Indikator loading muncul saat pemuatan data

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Alur 3: E-Report & Ekspor (REPT-01, REPT-02)

### 3.1 Halaman E-Report
- Klik menu "E-Report" di sidebar
- **Diharapkan:** Halaman E-Report terbuka dengan filter tanggal (Harian, Mingguan, Bulanan) dan tabel laporan harian
- Pilih preset "Bulanan" — **Diharapkan:** Tabel menampilkan data untuk bulan ini

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 3.2 Filter Laporan
- Coba semua preset: Harian, Mingguan, Bulanan
- Coba filter kustom: isi Tanggal Mulai dan Tanggal Akhir
- **Diharapkan:** Tabel dan ringkasan berubah sesuai filter

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 3.3 Ekspor PDF (REPT-02)
- Klik tombol "Export PDF"
- **Diharapkan:** Browser mengunduh file PDF
- Buka file PDF yang diunduh
- **Diharapkan:** PDF rapi dengan tabel laporan harian, format Rupiah Indonesia (Rp 1.234.567), siap cetak
- **Diharapkan:** Header PDF menampilkan nama outlet dan periode laporan

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 3.4 Ekspor CSV
- Klik tombol "Export CSV"
- **Diharapkan:** Browser mengunduh file CSV
- Buka file CSV di Excel
- **Diharapkan:** Kolom: Tanggal, Omset (Rp), Menu Terlaris, Jumlah Transaksi
- **Diharapkan:** Encoding benar (karakter Indonesia tampil sempurna), delimiter titik koma (;)
- **Diharapkan:** Karakter `=` di awal sel tidak menyebabkan error Excel (perlindungan formula injection)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Alur 4: Input Data Transaksi (DATA-01, DATA-02)

### 4.1 Input Manual (DATA-02)
- Klik menu "Data Entry" di sidebar (atau navigasi ke /data-entry)
- Isi form: Tanggal (format YYYY-MM-DD), Omset (angka), Menu Terlaris (pisahkan dengan koma atau tambah satu per satu)
- Klik Submit/Simpan
- **Diharapkan:** Data tersimpan, muncul konfirmasi sukses
- Kembali ke Dasbor — **Diharapkan:** Data baru muncul di grafik dalam waktu ≤3 detik

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 4.2 Validasi Input
- Coba submit form dengan Tanggal kosong
- **Diharapkan:** Sistem menampilkan pesan error validasi
- Coba submit form dengan Omset negatif
- **Diharapkan:** Sistem menolak dan menampilkan pesan error
- Coba submit dengan tanggal yang sudah ada datanya (duplikat)
- **Diharapkan:** Sistem menampilkan pesan error "Data untuk tanggal tersebut sudah ada"

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 4.3 Suntik Data Simulasi (DATA-01)
- Klik tombol "Suntik Data Simulasi" di halaman admin (jika tersedia)
- **Diharapkan:** Sistem membuat data fiktif untuk beberapa periode
- **Diharapkan:** Data baru muncul di dasbor setelah inject

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Alur 5: Tampilan Mobile (320px)

### 5.1 Dasbor di Mobile
- Buka Dasbor di tampilan mobile (320px lebar, atau buka di smartphone)
- **Diharapkan:** Tidak ada scroll horizontal (geser kiri-kanan)
- **Diharapkan:** Sidebar muncul sebagai overlay (tekan hamburger ☰)
- **Diharapkan:** Grafik bertumpuk vertikal
- **Diharapkan:** Semua tombol dapat disentuh dengan mudah (tinggi ≥44px)
- **Diharapkan:** Kartu ringkasan dan tombol export full-width

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 5.2 E-Report di Mobile
- Buka halaman E-Report di mobile
- **Diharapkan:** Tabel laporan memiliki scroll horizontal (overflow-x-auto)
- **Diharapkan:** Tombol Export PDF dan CSV full-width, mudah disentuh

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 5.3 Ekspor di Mobile
- Dari halaman E-Report di mobile, klik "Export PDF"
- **Diharapkan:** File PDF tetap terunduh dan terbaca di perangkat mobile

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 5.4 Login di Mobile
- Buka halaman Login di mobile
- **Diharapkan:** Form login full-width, tombol "Masuk" full-width
- **Diharapkan:** Tidak ada elemen yang terpotong

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Alur 6: Pengujian Keamanan Dasar

### 6.1 Akses Halaman Tanpa Login
- Logout dari sistem
- Coba akses langsung: http://localhost:5173/dashboard
- **Diharapkan:** Diarahkan kembali ke halaman Login (tidak bisa melihat dasbor)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 6.2 Input Berbahaya
- Di halaman Data Entry, masukkan teks HTML di field Menu Terlaris: `<script>alert('xss')</script>`
- Submit dan lihat di Dasbor
- **Diharapkan:** Teks ditampilkan apa adanya (tidak dieksekusi sebagai script)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

### 6.3 Percobaan SQL Injection
- Di halaman Login, masukkan username: `' OR '1'='1`
- **Diharapkan:** Sistem menolak login (tidak ada bypass autentikasi)

**Hasil:** ⬜ Berhasil / ⬜ Gagal — [catatan]

## Eksplorasi Bebas

Setelah menyelesaikan alur terpandu di atas, silakan eksplorasi sistem secara bebas:
- Coba kombinasi filter tanggal yang berbeda
- Coba ekspor laporan untuk periode yang sangat panjang atau sangat pendek
- Coba masukkan data dengan nilai ekstrem (omset sangat besar, menu sangat banyak)
- Coba gunakan sistem di perangkat yang berbeda (smartphone, tablet, laptop)
- Coba refresh browser di tengah-tengah pengisian form
- Coba buka dua tab browser sekaligus

Catat setiap masalah yang ditemukan di bawah ini:

**Masalah ditemukan saat eksplorasi:**
1. [deskripsi masalah]
2. [deskripsi masalah]
3. [deskripsi masalah]
4. [deskripsi masalah]
5. [deskripsi masalah]
