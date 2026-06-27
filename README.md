# RestoPulse — Panduan Singkat untuk Pemilik Restoran

RestoPulse adalah sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran. Sistem ini mengubah data penjualan harian menjadi grafik interaktif serta menghasilkan dokumen laporan keuangan digital yang siap unduh dan cetak, sehingga Anda tidak perlu lagi menghabiskan waktu berjam-jam untuk rekapitulasi manual.

## Cara Login

Buka URL aplikasi RestoPulse di browser Anda. Pada halaman login, masukkan username dan password yang telah didaftarkan sebelumnya. Klik tombol **Login**, dan Anda akan diarahkan secara otomatis ke halaman Dasbor Utama. Jika belum memiliki akun, Anda dapat mendaftar terlebih dahulu melalui halaman register yang tersedia di bawah formulir login.

## Melihat Dasbor

Setelah login, Anda akan masuk ke halaman **Dasbor Utama**. Di bagian atas, Anda dapat memilih rentang tanggal dengan preset **7 Hari**, **30 Hari**, **90 Hari**, atau mengatur tanggal kustom sesuai kebutuhan. Dasbor menampilkan **Line Chart Tren Omset Harian** yang menunjukkan perubahan pendapatan dari waktu ke waktu, serta **Pie Chart Menu Terlaris** yang memperlihatkan persentase kontribusi setiap menu terhadap total penjualan. Sentuh atau arahkan kursor ke titik pada grafik untuk melihat tooltip detail nominal dan nama menu.

## Mengekspor Laporan

Untuk menghasilkan laporan keuangan, buka halaman **E-Report** melalui menu navigasi di sidebar. Pilih rentang tanggal laporan yang diinginkan menggunakan filter tanggal yang tersedia. Setelah data ringkasan muncul di layar, klik tombol **Export PDF** untuk mengunduh laporan dalam format PDF siap cetak, atau klik **Export CSV** untuk mengunduh data mentah dalam format CSV yang dapat dibuka di Excel. File akan diunduh secara otomatis ke perangkat Anda.

## Menyuntik Data Demo

Jika Anda ingin mencoba fitur dasbor dan laporan dengan data simulasi, buka halaman **Data Entry** melalui menu navigasi. Gulir ke bagian bawah halaman hingga menemukan bagian **Suntik Data Simulasi**. Tentukan jumlah hari data yang ingin dibuat (maksimal 365 hari). Centang kotak konfirmasi dengan tulisan *"Saya mengerti bahwa data simulasi akan digunakan untuk keperluan demo"*. Setelah dicentang, tombol **Suntik Data Simulasi** akan aktif. Klik tombol tersebut dan tunggu hingga muncul notifikasi sukses yang menampilkan jumlah hari data yang berhasil dibuat.

### Skenario Demo

Berikut adalah alur lengkap yang dapat Anda ikuti untuk presentasi demo:

1. Daftarkan akun baru melalui halaman login, atau gunakan akun yang sudah ada.
2. Login dan perhatikan Dasbor Utama dalam kondisi kosong atau minimal.
3. Buka halaman **Data Entry**, gulir ke bagian **Suntik Data Simulasi**, tentukan jumlah hari, centang kotak konfirmasi, lalu klik tombol **Suntik Data Simulasi**.
4. Tunggu notifikasi sukses muncul, lalu kembali ke halaman **Dasbor**.
5. Perhatikan bahwa **Line Chart Tren Omset Harian** dan **Pie Chart Menu Terlaris** kini menampilkan data simulasi sesuai jumlah hari yang dipilih.
6. Buka halaman **E-Report**, pilih rentang tanggal **Bulanan**, lalu klik **Export PDF** untuk mendemonstrasikan hasil laporan.

> **Catatan teknis:** Fitur suntik data mengirimkan permintaan `POST /api/admin/dummy-inject` dengan parameter `days` (jumlah hari) dan `confirm: true` setelah pengguna memberikan persetujuan melalui kotak centang konfirmasi.

## Verifikasi Deployment

Anda dapat memverifikasi bahwa aplikasi RestoPulse berjalan dengan normal menggunakan perintah curl berikut:

```bash
# Verifikasi health check backend
curl -s https://<backend-url>/health

# Contoh respons yang diharapkan:
# {"status":"ok","timestamp":"2026-06-27T00:00:00.000Z","version":"1.0.0","environment":"production"}

# Verifikasi endpoint autentikasi (register)
curl -s -X POST https://<backend-url>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"demo_pass123","outlet_name":"Resto Demo"}'
```

Ganti `<backend-url>` dengan URL backend RestoPulse Anda (contoh: `https://restopulse-api.onrender.com`).

---

*Panduan ini ditulis untuk pemilik restoran. Untuk dokumentasi teknis pengembangan, silakan merujuk ke tim pengembang RestoPulse.*
