# RestoPulse — Implementation Phases

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## Phase 1 — Foundation

### Goal
Membangun fondasi teknis yang kokoh: repository terstruktur, database lengkap, autentikasi aman, API core, dan layout frontend dasar.

### Deliverables
- Prisma schema lengkap dengan 7 entitas (termasuk `MonthlyExpense` & `CateringOrder`).
- Migration database (PostgreSQL & SQLite dev).
- API RESTful core dengan Express.js, Zod validation, CORS, rate limiting.
- Auth system (register/login) dengan bcrypt + JWT.
- Middleware proteksi route & session management.
- Frontend core layout (sidebar, header, dark theme, routing).
- Health check endpoint & environment configuration.

### Dependencies
- Tidak ada (fase pertama).

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema Prisma tidak kompatibel antara SQLite dev & PostgreSQL prod | Medium | High | Gunakan tipe data yang kompatibel (UUID, DateTime) dan test migrate di kedua provider. |
| Konfigurasi CORS/rate limit terlalu ketat saat dev | Low | Medium | Dokumentasikan env var untuk mengatur whitelist & limit saat development. |

### Acceptance Criteria
1. `npm run dev` berhasil menjalankan backend.
2. `npm run build` di frontend berhasil tanpa error TypeScript.
3. Endpoint `/api/auth/register` dan `/api/auth/login` merespons sesuai Zod schema.
4. Halaman login dapat diakses dan redirect ke dashboard setelah login sukses.
5. Health check `GET /health` merespons JSON dengan `status: "ok"`.

### Definition of Done
- Semua kode di-merge ke branch `main`.
- PR di-review minimal 1 anggota tim.
- Tidak ada error lint (Oxlint / tsc).
- Schema Prisma ter-migrate di local dev.

---

## Phase 2 — Dashboard

### Goal
Menyediakan dasbor analitik utama yang interaktif, responsif, dan otomatis memuat data terbaru.

### Deliverables
- Dashboard page dengan dark theme & font ≥ 24pt untuk data finansial.
- KPI cards: Total Omset, Hari Tercatat, Rata-rata Harian.
- Line Chart tren omset harian (Chart.js).
- Pie Chart menu terlaris (Chart.js).
- Tooltip interaktif saat titik grafik disentuh (FR-007).
- Auto-refresh mechanism (polling 30s atau SWR-like fetch).
- Date range presets: 7 Hari, 30 Hari, 90 Hari, Custom.
- Empty state & loading skeletons.

### Dependencies
- Phase 1 (Foundation).
- Phase 3 (Data Management) untuk demonstrasi data real/simulasi — namun UI dapat dibangun dengan mock data terlebih dahulu.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bundle Chart.js terlalu besar | Medium | Medium | Import komponen Chart.js secara modular; lazy load jika perlu. |
| Polling membebani server | Low | Medium | Gunakan interval 30 detik & abort controller saat unmount. |

### Acceptance Criteria
1. Dashboard menampilkan KPI cards dalam ≤ 3 detik setelah data tersedia (NFR-9.1).
2. Line Chart memetakan tanggal berurutan (sumbu X) dan nominal omset (sumbu Y) secara presisi.
3. Pie Chart menampilkan persentase kontribusi menu terlaris.
4. Tooltip muncul saat hover/tap dengan detail nominal & nama menu.
5. Page load dashboard ≤ 4 detik pada koneksi 4G (NFR-9.3).

### Definition of Done
- Dashboard dapat diakses setelah login.
- Semua chart responsif (mobile & desktop).
- Kode ter-review & lolos lint.
- Unit test untuk utility agregasi (jika ada logic kompleks di frontend).

---

## Phase 3 — Data Management

### Goal
Memberikan kontrol penuh kepada pemilik atas data aplikasi melalui tiga aksi utama: **Reset Data**, **Run Simulation**, dan **Manual Data Entry**.

### Deliverables
- **Reset Data:**
  - Tombol dengan modal konfirmasi dua tingkat & peringatan data tidak dapat dipulihkan.
  - API `POST /api/admin/reset-data` (owner-only, transaction Prisma).
  - Menghapus: DailySales, MonthlyExpense, CateringOrder, SalesTrend, DailySalesReport (per outlet).
  - Auto-refresh dashboard & notifikasi sukses.

- **Run Simulation:**
  - Form pilihan jumlah hari (1–365) & tanggal mulai opsional.
  - Generator data realistis (revenue, menu sales, expenses, catering).
  - Konfirmasi eksplisit jika data simulasi (`data_source = 'DUMMY'`) sudah ada.
  - Regenerasi analytics otomatis.

- **Manual Data Entry:**
  - Tabbed form: Daily Sales (Date, Revenue, Best-selling Menu).
  - Tabbed form: Monthly Expenses (Category, Amount, Month, Year).
  - Tabbed form: Catering Orders (Client, Date, Amount, Status, Notes).
  - Validasi Zod real-time & notifikasi toast.
  - Setiap create/update mencatat `StatusLog`.

### Dependencies
- Phase 1 (Foundation) — schema & auth.
- Phase 2 (Dashboard) — untuk verifikasi auto-refresh setelah data berubah.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Reset data salah sasaran (menghapus data REAL) | Medium | Critical | Filter delete hanya untuk outlet terkait; tampilkan ringkasan data yang akan dihapus di modal konfirmasi. |
| Simulasi 365 hari timeout | Low | Medium | Jalankan insert dalam batch transaction; tampilkan progress indicator jika memungkinkan. |
| Race condition saat simulasi & input manual bersamaan | Low | Medium | Gunakan database transaction & row-level locking jika diperlukan. |

### Acceptance Criteria
1. Reset data menampilkan dialog konfirmasi dengan peringatan tidak dapat dipulihkan.
2. Reset data menghapus semua data transaksional & cache analytics dalam satu transaksi atomik.
3. Simulasi menghasilkan data realistis (tidak purely random; ada variasi akhir pekan, menu weighted).
4. Jika data simulasi sudah ada, sistem menampilkan konfirmasi replace sebelum melanjutkan.
5. Form manual entry menolak input invalid (tanggal di masa depan, nominal negatif, status tidak valid).
6. Dashboard memperbarui tampilan dalam ≤ 3 detik setelah input manual atau simulasi.

### Definition of Done
- Semua form memiliki validasi client-side & server-side.
- StatusLog tercatat untuk setiap operasi reset & manual entry.
- Kode ter-review & lolos lint.
- Integration test untuk reset & simulasi endpoint.

---

## Phase 4 — Financial Features

### Goal
Memantau kesehatan finansial bisnis melalui pencatatan pengeluaran bulanan dan kalkulasi laba/rugi.

### Deliverables
- Backend API CRUD untuk `MonthlyExpense`.
- Frontend form & list pengeluaran bulanan dengan dropdown kategori.
- Kartu ringkasan laba/rugi di dashboard (pemasukan − pengeluaran).
- Conditional styling: hijau/kuning untuk untung, merah untuk rugi.
- Integrasi pengeluaran ke agregasi dashboard & E-Report.

### Dependencies
- Phase 1 (Foundation) — schema `MonthlyExpense`.
- Phase 2 (Dashboard) — untuk menampilkan kartu laba/rugi.
- Phase 3 (Data Management) — form input manual pengeluaran.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Kalkulasi laba/rugi tidak sinkron dengan data dashboard | Medium | High | Gunakan query SQL/Prisma agregasi yang sama untuk dashboard & E-Report. |

### Acceptance Criteria
1. Kartu laba/rugi menampilkan selisih akurat antara total pemasukan & total pengeluaran bulan yang dipilih.
2. Indikator warna merah muncul saat nilai negatif (rugi).
3. Pengeluaran tercatat di `StatusLog` saat dibuat/diubah.
4. Data pengeluaran immutable setelah report bulanan di-generate (validasi server-side).

### Definition of Done
- API terdokumentasi (inline comments atau Swagger jika digunakan).
- Frontend responsive untuk form & list.
- Kode ter-review & lolos lint.

---

## Phase 5 — Catering

### Goal
Mengelola pesanan catering/partai besar sebagai sumber pendapatan terpisah yang terintegrasi.

### Deliverables
- Backend API CRUD untuk `CateringOrder`.
- Validasi status workflow: hanya transisi maju (`Pending` → `Confirmed` → `Done`).
- Frontend form & list catering dengan badge status berwarna.
- Dashboard widget: total nilai catering & jumlah per status.
- Section Catering di E-Report (terpisah dari penjualan harian).
- Integrasi nominal catering ke total pendapatan E-Report.

### Dependencies
- Phase 1 (Foundation) — schema `CateringOrder`.
- Phase 2 (Dashboard) — untuk widget ringkasan.
- Phase 6 (Reports) — untuk section di E-Report (bisa dikerjakan paralel).

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Status catering diubah secara tidak sah (mundur) | Low | Medium | Validasi transisi status di backend; jangan andalkan validasi frontend saja. |

### Acceptance Criteria
1. Status catering hanya bisa diubah maju (tidak bisa `Done` → `Confirmed`).
2. Nominal catering masuk ke perhitungan total pendapatan di E-Report.
3. Dashboard menampilkan ringkasan catering dalam ≤ 3 detik setelah perubahan.
4. Section catering di E-Report jelas terpisah dari data penjualan harian.

### Definition of Done
- Workflow status tercover oleh integration test.
- UI responsive & accessible.
- Kode ter-review & lolos lint.

---

## Phase 6 — Reports

### Goal
Menghasilkan dokumen formal pembukuan digital yang valid, bersih, siap cetak, dan siap diunduh.

### Deliverables
- E-Report page dengan filter rentang tanggal (harian/mingguan/bulanan/kustom).
- Ringkasan di layar: total pendapatan, total pengeluaran, laba/rugi, top menu, catering summary.
- Export PDF menggunakan `jspdf` + `jspdf-autotable` (layout rapi, print-friendly).
- Export CSV (raw data, Excel-compatible).
- Validasi format tanggal & pesan error jika data tidak ditemukan.

### Dependencies
- Phase 1 (Foundation) — API core & auth.
- Phase 4 (Financial) — data pengeluaran untuk kalkulasi laba/rugi.
- Phase 5 (Catering) — data catering untuk section terpisah.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PDF layout rusak di browser lama | Low | Medium | Gunakan library stabil (jspdf-autotable); test di Chrome, Firefox, Safari. |
| File CSV corrupt karena encoding | Low | Medium | Gunakan UTF-8 BOM; escape karakter khusus (koma, newline). |

### Acceptance Criteria
1. E-Report menampilkan ringkasan lengkap sesuai filter tanggal yang dipilih.
2. PDF terunduh utuh dengan tata letak rapi (≥ 98% success rate).
3. CSV dapat dibuka langsung di Excel / Google Sheets tanpa corrupt.
4. Jika tidak ada data di periode yang dipilih, tampilkan pesan informatif (bukan error crash).

### Definition of Done
- Export diuji di minimal 3 browser modern.
- Kode ter-review & lolos lint.
- Integration test untuk endpoint report & export.

---

## Phase 7 — AI Integration

### Goal
Memberikan wawasan bisnis otomatis dalam Bahasa Indonesia melalui Google Gemini.

### Deliverables
- Service layer `aiService.ts` untuk komunikasi dengan Gemini API.
- API `POST /api/ai/summary` yang mengambil data agregasi dari DB, membangun prompt, dan mengembalikan ringkasan.
- Tombol "Ringkasan AI" di pojok kanan atas dashboard (berdampingan tombol Segarkan).
- Modal/card hasil ringkasan AI dengan loading indicator.
- Pesan error informatif jika Gemini API tidak tersedia / quota habis (tidak crash dashboard).

### Dependencies
- Phase 1 (Foundation) — environment var `GEMINI_API_KEY`.
- Phase 2 (Dashboard) — untuk penempatan tombol & tampilan hasil.
- Phase 6 (Reports) — data lengkap yang diperlukan AI untuk analisis akurat.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API tidak stabil / quota habis | Medium | High | Implementasi mock/fallback response; cache ringkasan terakhir jika memungkinkan. |
| Prompt tidak menghasilkan output yang konsisten | Medium | Medium | Gunakan prompt template yang ketat dengan contoh (few-shot); validasi output di backend. |
| Latensi Gemini tinggi (>10 detik) | Medium | Medium | Tampilkan loading indicator; timeout request dengan pesan error yang jelas. |

### Acceptance Criteria
1. Ringkasan AI mencakup: tren omset, menu terlaris, pengeluaran, laba/rugi, catering, dan rekomendasi singkat.
2. Output dalam Bahasa Indonesia yang mudah dipahami.
3. Loading indicator muncul saat menunggu respons.
4. Jika API gagal, dashboard tetap berfungsi normal & menampilkan pesan error ramah.
5. Tombol tidak aktif / menampilkan pesan jika tidak ada data di periode yang dipilih.

### Definition of Done
- Prompt diuji dengan berbagai skenario data (kosong, sedikit, banyak).
- Error handling tercover oleh test.
- Kode ter-review & lolos lint.

---

## Phase 8 — QA & Deployment

### Goal
Memastikan kualitas, keamanan, performa, dan ketersediaan sistem sebelum soft launch.

### Deliverables
- Unit & integration tests untuk semua modul (Vitest + Supertest + React Testing Library).
- Load testing dengan k6 (50 transaksi bersamaan, response ≤ 500ms).
- Lighthouse audit (page load ≤ 4s, bundle ≤ 800KB).
- Security audit: JWT secret, CORS, rate limiting, input sanitization.
- UAT oleh pemilik resto (workflow lengkap).
- Deployment ke production (Railway) dengan PostgreSQL.
- Health check monitoring & dokumentasi rollback.

### Dependencies
- Semua Phase 1–7 selesai.

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bug kritis ditemukan saat UAT | Medium | High | Alokasikan buffer waktu 2–3 hari di akhir fase untuk perbaikan. |
| Deployment gagal di production | Low | High | Siapkan staging environment; uji deployment pipeline sebelum hari-H. |
| Performance tidak memenuhi NFR | Medium | High | Lakukan profiling & optimization lebih awal (Phase 2–3). |

### Acceptance Criteria
1. Semua test case untuk FR Must Have (FR-001 s.d. FR-005) lolos.
2. Load test 50 transaksi bersamaan sukses dengan response time API ≤ 500ms (NFR-9.4).
3. Page load dashboard ≤ 4 detik & total page weight ≤ 800KB (NFR-9.3).
4. UAT: workflow login → simulasi → dashboard → input manual → E-Report → export PDF berjalan lancar.
5. Sistem uptime ≥ 99,5% selama 24 jam pertama di production (NFR-9.2).

### Definition of Done
- Semua checklist QA terchecklist.
- Dokumentasi deployment (`DEPLOYMENT.md`) diperbarui dengan URL aktual.
- Tim setuju untuk soft launch.

---

*End of Document*
