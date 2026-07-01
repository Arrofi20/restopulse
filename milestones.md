# RestoPulse — Milestones

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## Milestone 1: Foundation — Database, API Core & Auth

| Attribute | Detail |
|-----------|--------|
| **Owner** | Backend Developer |
| **Timeline** | Minggu 1 |
| **Phase Mapping** | Phase 1 |

### Goal
Membangun fondasi teknis yang kokoh: database lengkap, autentikasi aman, API core, dan layout frontend dasar.

### Deliverables
- Prisma schema lengkap (7 entitas: OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport, MonthlyExpense, CateringOrder).
- Migration database (SQLite dev & PostgreSQL prod).
- API auth (register/login) dengan bcrypt + JWT.
- Middleware proteksi route & rate limiting.
- Frontend core layout (sidebar, header, dark theme, routing).
- Health check endpoint.

### Dependencies
- Tidak ada.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Inkompatibilitas schema SQLite ↔ PostgreSQL | High | Gunakan tipe data kompatibel (UUID, DateTime); uji migrate di kedua provider. |
| Konfigurasi environment yang rumit | Medium | Dokumentasikan `.env.example` dengan jelas. |

### Acceptance Criteria
1. Semua entitas data (Section 8 PRD) terimplementasi di Prisma schema.
2. API auth merespons dengan benar (register, login, token validasi).
3. Halaman login dan layout dasar dapat diakses di browser.
4. Health check `GET /health` merespons JSON `{ status: "ok" }`.
5. Tidak ada error lint (tsc / Oxlint).

### Definition of Done
- Kode di-merge ke `main`.
- PR di-review minimal 1 anggota tim.
- Schema ter-migrate di local dev.
- `README.md` teknis diperbarui jika ada perubahan setup.

---

## Milestone 2: Dashboard — Frontend Analytics & Visualization

| Attribute | Detail |
|-----------|--------|
| **Owner** | Frontend Developer |
| **Timeline** | Minggu 2 |
| **Phase Mapping** | Phase 2 |

### Goal
Dasbor analitik utama yang interaktif, responsif, dan otomatis memuat data terbaru dalam ≤ 3 detik.

### Deliverables
- Dashboard page dengan dark theme & font ≥ 24pt untuk data finansial.
- KPI cards: Total Omset, Hari Tercatat, Rata-rata Harian.
- Line Chart tren omset harian & Pie Chart menu terlaris (Chart.js).
- Tooltip interaktif (FR-007).
- Auto-refresh mechanism (polling 30 detik).
- Date range presets (7D, 30D, 90D, Custom) & empty state.

### Dependencies
- Milestone 1 (Foundation).

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Bundle Chart.js membesar | Medium | Import modular; lazy load jika perlu. |
| Polling berlebihan | Low | Interval 30 detik & abort controller. |

### Acceptance Criteria
1. Dashboard menampilkan KPI & chart dalam ≤ 3 detik setelah data tersedia (NFR-9.1).
2. Line Chart & Pie Chart sinkron presisi dengan data DB (Section 3 PRD).
3. Tooltip muncul saat hover/tap dengan detail lengkap.
4. Page load dashboard ≤ 4 detik pada koneksi 4G (NFR-9.3).
5. Chart responsif di mobile & desktop.

### Definition of Done
- Dashboard dapat diakses setelah login.
- Kode ter-review & lolos lint.
- Unit test untuk utility agregasi (jika ada logic kompleks di frontend).

---

## Milestone 3: Data Management — Reset, Simulate & Manual Entry

| Attribute | Detail |
|-----------|--------|
| **Owner** | Full-Stack Developer |
| **Timeline** | Minggu 3 |
| **Phase Mapping** | Phase 3 |

### Goal
Pemilik dapat mengontrol data aplikasi melalui tiga aksi utama: Reset Data, Run Simulation, dan Manual Data Entry.

### Deliverables
- **Reset Data:** Tombol + modal konfirmasi dua tingkat + API transaction Prisma + notifikasi sukses + auto-refresh dashboard.
- **Run Simulation:** Form jumlah hari & tanggal mulai opsional + generator data realistis + konfirmasi replace jika data simulasi sudah ada + regenerasi analytics.
- **Manual Data Entry:** Tabbed form untuk Daily Sales, Monthly Expenses, dan Catering Orders + validasi Zod + toast notifikasi + `StatusLog` audit.

### Dependencies
- Milestone 1 (Foundation).
- Milestone 2 (Dashboard) — untuk verifikasi auto-refresh.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Reset data menghapus data REAL yang tidak sengaja | Critical | Filter delete per outlet; tampilkan ringkasan data yang akan dihapus di modal. |
| Simulasi timeout pada 365 hari | Medium | Batch insert dalam transaction; tampilkan progress jika memungkinkan. |

### Acceptance Criteria
1. Reset data menampilkan peringatan tidak dapat dipulihkan dan memerlukan konfirmasi eksplisit.
2. Reset menghapus Sales, Expenses, Catering, Reports, Analytics cache, Simulation data dalam satu transaksi atomik.
3. Simulasi menghasilkan data yang terlihat realistis (variasi akhir pekan, menu weighted, catering sporadis).
4. Jika data simulasi sudah ada, sistem meminta konfirmasi replace (PRD Edge Case).
5. Form manual entry menolak input invalid dan mencatat audit log.
6. Dashboard memperbarui tampilan dalam ≤ 3 detik setelah operasi data.

### Definition of Done
- Semua form memiliki validasi client-side & server-side.
- `StatusLog` tercatat untuk setiap operasi.
- Kode ter-review & lolos lint.
- Integration test untuk reset & simulasi.

---

## Milestone 4: Financial Features — Expenses & Profit/Loss

| Attribute | Detail |
|-----------|--------|
| **Owner** | Full-Stack Developer |
| **Timeline** | Minggu 4 |
| **Phase Mapping** | Phase 4 |

### Goal
Pemilik dapat mencatat pengeluaran bulanan dan melihat kalkulasi laba/rugi secara akurat di dashboard.

### Deliverables
- API CRUD `MonthlyExpense`.
- Frontend form & list pengeluaran dengan dropdown kategori (Bahan Baku, Gaji, Operasional, Lainnya).
- Kartu ringkasan laba/rugi di dashboard dengan conditional styling.
- Integrasi pengeluaran ke agregasi dashboard & E-Report.

### Dependencies
- Milestone 1 (Foundation) — schema `MonthlyExpense`.
- Milestone 2 (Dashboard) — untuk kartu laba/rugi.
- Milestone 3 (Data Management) — untuk form input manual.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Kalkulasi laba/rugi tidak sinkron antar halaman | High | Gunakan query agregasi yang sama untuk dashboard & E-Report. |

### Acceptance Criteria
1. Kartu laba/rugi menampilkan selisih akurat pemasukan vs pengeluaran.
2. Indikator warna merah muncul saat rugi (nilai negatif).
3. Pengeluaran tercatat di `StatusLog`.
4. Data pengeluaran immutable setelah report bulanan di-generate.

### Definition of Done
- API terdokumentasi.
- Frontend responsive.
- Kode ter-review & lolos lint.

---

## Milestone 5: Catering — CRUD, Dashboard & E-Report Integration

| Attribute | Detail |
|-----------|--------|
| **Owner** | Full-Stack Developer |
| **Timeline** | Minggu 4–5 |
| **Phase Mapping** | Phase 5 |

### Goal
Mengelola pesanan catering sebagai sumber pendapatan terpisah yang terintegrasi penuh.

### Deliverables
- API CRUD `CateringOrder` dengan validasi status workflow (Pending → Confirmed → Done).
- Frontend form & list catering dengan badge status.
- Dashboard widget ringkasan catering (total nilai, jumlah per status).
- Section Catering di E-Report (terpisah dari penjualan harian).
- Integrasi nominal catering ke total pendapatan E-Report.

### Dependencies
- Milestone 1 (Foundation) — schema `CateringOrder`.
- Milestone 2 (Dashboard) — untuk widget.
- Milestone 6 (Reports) — untuk section E-Report (bisa paralel).

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Status catering diubah mundur | Medium | Validasi transisi di backend; reject invalid transitions. |

### Acceptance Criteria
1. Status catering hanya bisa maju (tidak bisa mundur).
2. Nominal catering masuk ke total pendapatan E-Report.
3. Dashboard memperbarui ringkasan catering dalam ≤ 3 detik.
4. Section catering di E-Report jelas terpisah.

### Definition of Done
- Workflow status tercover integration test.
- UI responsive.
- Kode ter-review & lolos lint.

---

## Milestone 6: Reports — E-Report, PDF & CSV Export

| Attribute | Detail |
|-----------|--------|
| **Owner** | Full-Stack/Frontend Developer |
| **Timeline** | Minggu 5 |
| **Phase Mapping** | Phase 6 |

### Goal
Menghasilkan dokumen laporan keuangan digital yang valid, rapi, siap cetak, dan siap diunduh.

### Deliverables
- E-Report page dengan filter rentang tanggal (harian/mingguan/bulanan/kustom).
- Ringkasan di layar: total pendapatan, total pengeluaran, laba/rugi, top menu, catering summary.
- Export PDF (`jspdf` + `jspdf-autotable`) dengan layout rapi.
- Export CSV (UTF-8 BOM, escaped characters).
- Validasi format tanggal & pesan error jika data tidak ditemukan.

### Dependencies
- Milestone 1 (Foundation) — API core.
- Milestone 4 (Financial) — data pengeluaran.
- Milestone 5 (Catering) — data catering.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| PDF layout rusak di browser tertentu | Medium | Test di Chrome, Firefox, Safari; gunakan library stabil. |
| CSV corrupt karena encoding/karakter khusus | Low | Gunakan UTF-8 BOM; escape commas & newlines. |

### Acceptance Criteria
1. E-Report menampilkan ringkasan lengkap sesuai filter tanggal.
2. PDF terunduh utuh dengan layout rapi (≥ 98% success rate).
3. CSV dapat dibuka langsung di Excel / Google Sheets.
4. Jika data tidak ditemukan, tampilkan pesan informatif.

### Definition of Done
- Export diuji di 3 browser modern.
- Kode ter-review & lolos lint.
- Integration test untuk report aggregation.

---

## Milestone 7: AI Integration — Gemini Business Summary

| Attribute | Detail |
|-----------|--------|
| **Owner** | Full-Stack Developer |
| **Timeline** | Minggu 6 |
| **Phase Mapping** | Phase 7 |

### Goal
Memberikan wawasan bisnis otomatis dalam Bahasa Indonesia melalui Google Gemini AI.

### Deliverables
- Service layer `aiService.ts` untuk komunikasi dengan Gemini API.
- API `POST /api/ai/summary` dengan prompt engineering.
- Tombol "Ringkasan AI" di dashboard (pojok kanan atas).
- Modal/card hasil ringkasan AI dengan loading indicator.
- Pesan error informatif jika API tidak tersedia (graceful degradation).

### Dependencies
- Milestone 1 (Foundation) — env var `GEMINI_API_KEY`.
- Milestone 2 (Dashboard) — penempatan tombol.
- Milestone 6 (Reports) — data lengkap untuk analisis akurat.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Gemini API tidak stabil / quota habis | High | Mock/fallback response; cache ringkasan terakhir. |
| Prompt tidak konsisten | Medium | Prompt template ketat dengan few-shot examples. |
| Latensi tinggi | Medium | Loading indicator; timeout 15 detik dengan pesan error. |

### Acceptance Criteria
1. Ringkasan AI mencakup tren omset, menu terlaris, pengeluaran, laba/rugi, catering, dan rekomendasi.
2. Output dalam Bahasa Indonesia yang mudah dipahami.
3. Loading indicator muncul saat menunggu respons.
4. Jika API gagal, dashboard tetap berfungsi & menampilkan pesan error ramah.
5. Tombol menampilkan pesan jika tidak ada data di periode yang dipilih.

### Definition of Done
- Prompt diuji dengan berbagai skenario data.
- Error handling tercover test.
- Kode ter-review & lolos lint.

---

## Milestone 8: QA & Deployment — Testing, Performance, Security & Launch

| Attribute | Detail |
|-----------|--------|
| **Owner** | QA Engineer + Tim |
| **Timeline** | Minggu 6–7 |
| **Phase Mapping** | Phase 8 |

### Goal
Memastikan kualitas, keamanan, performa, dan ketersediaan sistem sebelum soft launch.

### Deliverables
- Unit & integration tests untuk semua modul (Vitest + Supertest + React Testing Library).
- Load testing dengan k6 (50 concurrent users, response ≤ 500ms).
- Lighthouse audit (page load ≤ 4s, bundle ≤ 800KB).
- Security audit (JWT, CORS, rate limit, input sanitization).
- UAT oleh pemilik resto.
- Deployment ke production (Railway) dengan PostgreSQL.
- Health check monitoring & rollback plan.

### Dependencies
- Milestone 1–7 selesai.

### Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Bug kritis saat UAT | High | Buffer waktu 2–3 hari di akhir fase untuk perbaikan. |
| Deployment gagal | High | Staging environment; uji pipeline sebelum hari-H. |
| Performance tidak memenuhi NFR | High | Profiling & optimization lebih awal (Milestone 2–3). |

### Acceptance Criteria
1. Semua test case untuk FR Must Have lolos.
2. Load test 50 transaksi bersamaan sukses, response ≤ 500ms (NFR-9.4).
3. Page load dashboard ≤ 4 detik & bundle ≤ 800KB (NFR-9.3).
4. UAT: workflow login → simulasi → dashboard → input manual → E-Report → export PDF lancar.
5. Sistem uptime ≥ 99,5% selama 24 jam pertama (NFR-9.2).

### Definition of Done
- Semua checklist QA terchecklist.
- `DEPLOYMENT.md` diperbarui dengan URL aktual.
- Tim setuju untuk soft launch.

---

## Milestone Dependency Matrix

|  | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 |
|--|----|----|----|----|----|----|----|----|
| **M1** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **M2** | | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **M3** | | | — | | | | | ✅ |
| **M4** | | | | — | | ✅ | | ✅ |
| **M5** | | | | | — | ✅ | | ✅ |
| **M6** | | | | | | — | ✅ | ✅ |
| **M7** | | | | | | | — | ✅ |
| **M8** | | | | | | | | — |

**Keterangan:** ✅ = Milestone di baris depend pada milestone di kolom.

---

*End of Document*
