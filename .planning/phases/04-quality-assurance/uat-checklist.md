# Checklist Acceptance — RestoPulse Phase 4 UAT

**Nama Pemilik:** ___________________
**Restoran:** ___________________
**Tanggal UAT:** ___________________
**Versi Sistem:** v1.0 Phase 4

## Fitur yang Diuji

| # | Fitur | Requirement | Diuji? | Hasil | Catatan |
|---|-------|------------|--------|-------|---------|
| 1 | Login dengan username & password valid | AUTH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 2 | Login ditolak dengan password salah | AUTH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 3 | Registrasi akun baru | AUTH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 4 | Validasi input registrasi (field kosong, username duplikat) | AUTH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 5 | Akses ke Dasbor setelah login | AUTH-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 6 | Logout kembali ke halaman Login | AUTH-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 7 | Line Chart tren omset harian | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 8 | Warna grafik: kuning naik, merah turun | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 9 | Pie Chart menu terlaris (top 10) | DASH-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 10 | Tooltip interaktif pada Line Chart | DASH-03 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 11 | Tooltip interaktif pada Pie Chart | DASH-03 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 12 | Filter tanggal preset (7 Hari, 30 Hari, Bulan Ini) | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 13 | Filter tanggal kustom (Tanggal Mulai - Tanggal Akhir) | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 14 | Kartu ringkasan (Total Omset, Jumlah Transaksi) | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 15 | Tombol refresh data | DASH-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 16 | Suntik data simulasi | DATA-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 17 | Input data transaksi manual | DATA-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 18 | Validasi input (tanggal kosong, omset negatif, duplikat) | DATA-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 19 | Filter laporan Harian/Mingguan/Bulanan | REPT-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 20 | Tabel laporan harian di halaman E-Report | REPT-01 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 21 | Ekspor laporan ke PDF | REPT-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 22 | Kualitas PDF: rapi, format Rupiah, header outlet + periode | REPT-02 | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 23 | Ekspor data ke CSV | (v2) | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 24 | Kualitas CSV: encoding benar, delimiter titik koma, aman Excel | (v2) | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 25 | Tampilan mobile (320px): tidak ada scroll horizontal | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 26 | Sidebar mobile: hamburger ☰ → overlay → tutup × | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 27 | Tombol touch target ≥44px di mobile | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 28 | Akses halaman tanpa login diblokir | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 29 | Input XSS ditampilkan aman (tidak dieksekusi) | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |
| 30 | Percobaan SQL injection ditolak | — | ⬜ | ⬜ Berhasil / ⬜ Gagal | |

## Audit Sebelum UAT

Sistem telah melalui 4 fase audit sebelum UAT:

| Audit | Plan | Hasil |
|-------|------|-------|
| API Functional Tests | 04-01 | ✅ 29/29 test lulus |
| Performance (k6 + Lighthouse) | 04-02 | ✅ Tools siap, benchmark perlu server berjalan |
| Accessibility (WCAG AA) | 04-03 | ✅ Lighthouse 100/100, 7 Major touch target fixed |
| Security (JWT + Injection) | 04-04 | ✅ 23/23 test lulus, semua guard terverifikasi |

## Ringkasan Bug

### Bug Diperbaiki Sebelum UAT

| # | Severitas | Deskripsi | Status |
|---|-----------|-----------|--------|
| 1 | Major | Touch target tombol hamburger <44px | ✅ Fixed |
| 2 | Major | Touch target tombol tutup sidebar <44px | ✅ Fixed |
| 3 | Major | Touch target preset DateFilter <44px | ✅ Fixed |
| 4 | Major | Touch target input tanggal DateFilter <44px | ✅ Fixed |
| 5 | Major | Touch target item navigasi sidebar <44px | ✅ Fixed |
| 6 | Major | Touch target tombol refresh <44px | ✅ Fixed |
| 7 | Major | Touch target preset ReportDateFilter <44px | ✅ Fixed |
| 8 | Major | Auth routes tanpa validasi Zod input | ✅ Fixed |

### Bug Ditemukan Saat UAT

| # | Severitas | Deskripsi | Status |
|---|-----------|-----------|--------|
| 1 | | | ⬜ Open / ⬜ Fixed |
| 2 | | | ⬜ Open / ⬜ Fixed |
| 3 | | | ⬜ Open / ⬜ Fixed |
| 4 | | | ⬜ Open / ⬜ Fixed |
| 5 | | | ⬜ Open / ⬜ Fixed |

**Total Bug Ditemukan:** ___
**Critical:** ___
**Major:** ___
**Minor:** ___

## Acceptance

Dengan ini saya menyatakan bahwa sistem RestoPulse telah diuji dan:

⬜ **DITERIMA** — Semua fitur Must Have berfungsi, bug Critical dan Major sudah diperbaiki.

⬜ **DITERIMA DENGAN CATATAN** — Fitur utama berfungsi, beberapa minor issue akan diperbaiki di v2.

⬜ **DITOLAK** — Ada bug Critical yang belum diperbaiki, perlu UAT ulang.

**Tanda Tangan Pemilik:** ___________________

**Tanggal:** ___________________

---

*Dokumen ini menjadi bukti formal bahwa RestoPulse Phase 4 telah lolos User Acceptance Testing oleh pemilik restoran.*
