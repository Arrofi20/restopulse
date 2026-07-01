# RestoPulse — Task Checklist

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## Legend

- `[ ]` — Pending
- `[~]` — In Progress
- `[x]` — Completed
- **Est.** — Estimated duration (hours)

---

## Milestone 1: Foundation — Database, API Core & Auth (Minggu 1)

### Backend Tasks
- [ ] **B1.1** — Finalize Prisma schema: tambahkan `MonthlyExpense` & `CateringOrder` beserta relasi ke `Outlet`. *(Est. 2h)*
- [ ] **B1.2** — Generate & apply migration untuk SQLite dev. *(Est. 1h)*
- [ ] **B1.3** — Update `schema.postgresql.prisma` & test migration PostgreSQL. *(Est. 1h)*
- [ ] **B1.4** — Implement `POST /api/auth/register` (Zod validation, bcrypt hash). *(Est. 2h)*
- [ ] **B1.5** — Implement `POST /api/auth/login` (bcrypt compare, JWT sign). *(Est. 2h)*
- [ ] **B1.6** — Implement `GET /api/auth/me` (verify token, return user). *(Est. 1h)*
- [ ] **B1.7** — Create `verifyToken` middleware untuk proteksi route. *(Est. 1h)*
- [ ] **B1.8** — Setup `express-rate-limit` (umum & auth-specific). *(Est. 1h)*
- [ ] **B1.9** — Setup CORS middleware dengan whitelist origin. *(Est. 1h)*
- [ ] **B1.10** — Implement `GET /health` endpoint. *(Est. 0.5h)*
- [ ] **B1.11** — Setup error handling middleware (consistent JSON error format). *(Est. 1h)*

### Frontend Tasks
- [ ] **F1.1** — Setup React Router dengan route `/login`, `/`, `/data`, `/reports`. *(Est. 1h)*
- [ ] **F1.2** — Implement `ProtectedRoute` wrapper (redirect ke login jika tidak auth). *(Est. 1h)*
- [ ] **F1.3** — Build `LoginPage` UI (username, password, error states). *(Est. 2h)*
- [ ] **F1.4** — Setup `AuthContext` (React Context) untuk menyimpan user & token. *(Est. 1h)*
- [ ] **F1.5** — Build core `Layout` component (sidebar nav, header, dark theme wrapper). *(Est. 2h)*
- [ ] **F1.6** — Setup Tailwind dark theme (bg-slate-900, text-white, text-yellow-400). *(Est. 1h)*
- [ ] **F1.7** — Create reusable API client (fetch wrapper dengan base URL & Bearer token). *(Est. 1h)*

### Database Tasks
- [ ] **D1.1** — Seed script: buat Outlet default & akun owner test. *(Est. 1h)*
- [ ] **D1.2** — Test DB connection script (`scripts/db-connect-test.ts`). *(Est. 0.5h)*

### Testing Tasks
- [ ] **T1.1** — Unit test untuk Zod auth schemas. *(Est. 1h)*
- [ ] **T1.2** — Integration test untuk register & login endpoints. *(Est. 2h)*

### Documentation Tasks
- [ ] **DOC1.1** — Update `README.md` dengan instruksi setup dev. *(Est. 1h)*
- [ ] **DOC1.2** — Update `DEPLOYMENT.md` jika ada perubahan env vars. *(Est. 0.5h)*

---

## Milestone 2: Dashboard — Frontend Analytics & Visualization (Minggu 2)

### Backend Tasks
- [ ] **B2.1** — Implement `GET /api/dashboard/summary?from=&to=` (total revenue, days, average). *(Est. 2h)*
- [ ] **B2.2** — Implement `GET /api/dashboard/trends?from=&to=` (array daily revenue). *(Est. 2h)*
- [ ] **B2.3** — Implement `GET /api/dashboard/menu-popularity?from=&to=` (array menu + percentage). *(Est. 2h)*
- [ ] **B2.4** — Implement `GET /api/dashboard/catering-summary?from=&to=` (total & count per status). *(Est. 1h)*
- [ ] **B2.5** — Add index optimization untuk query agregasi (pastikan `@index` sudah ada). *(Est. 1h)*

### Frontend Tasks
- [ ] **F2.1** — Build `KPICard` component (font ≥ 24pt, dark bg, conditional color). *(Est. 1h)*
- [ ] **F2.2** — Build `LineChart` component (Chart.js, gradient fill, responsive). *(Est. 2h)*
- [ ] **F2.3** — Build `PieChart` component (Chart.js, legend, percentages). *(Est. 2h)*
- [ ] **F2.4** — Implement custom tooltip callback untuk menampilkan nominal & menu. *(Est. 1h)*
- [ ] **F2.5** — Build `DateRangePicker` dengan preset 7D/30D/90D/Custom. *(Est. 2h)*
- [ ] **F2.6** — Build `DashboardPage` yang menggabungkan KPI, LineChart, PieChart. *(Est. 2h)*
- [ ] **F2.7** — Implement polling auto-refresh (30 detik) dengan cleanup. *(Est. 1h)*
- [ ] **F2.8** — Build `Skeleton` loading component. *(Est. 1h)*
- [ ] **F2.9** — Build `EmptyState` component untuk kondisi tanpa data. *(Est. 1h)*
- [ ] **F2.10** — Setup `useDashboard` custom hook untuk fetch & cache data. *(Est. 1h)*

### Database Tasks
- [ ] **D2.1** — Pastikan `SalesTrend` ter-generasi otomatis saat `DailySales` berubah (bisa via trigger atau service layer). *(Est. 2h)*

### Testing Tasks
- [ ] **T2.1** — Integration test untuk dashboard endpoints. *(Est. 2h)*
- [ ] **T2.2** — Unit test untuk date range utility functions. *(Est. 1h)*
- [ ] **T2.3** — Frontend test: `DashboardPage` render & chart presence. *(Est. 2h)*

### Documentation Tasks
- [ ] **DOC2.1** — Document API response format untuk dashboard. *(Est. 0.5h)*

---

## Milestone 3: Data Management — Reset, Simulate & Manual Entry (Minggu 3)

### Backend Tasks
- [ ] **B3.1** — Implement `POST /api/admin/reset-data` (Prisma transaction, owner-only). *(Est. 2h)*
- [ ] **B3.2** — Implement `POST /api/admin/simulate` (generator logic, replace confirmation check). *(Est. 3h)*
- [ ] **B3.3** — Build simulation generator: realistic revenue with weekend spikes. *(Est. 2h)*
- [ ] **B3.4** — Build simulation generator: weighted menu sales. *(Est. 1h)*
- [ ] **B3.5** — Build simulation generator: random expenses (3–5 categories/month). *(Est. 1h)*
- [ ] **B3.6** — Build simulation generator: random catering orders (0–3/week). *(Est. 1h)*
- [ ] **B3.7** — Implement `POST /api/sales` (Daily Sales manual entry, Zod validation). *(Est. 1h)*
- [ ] **B3.8** — Implement `POST /api/expenses` (Monthly Expense manual entry). *(Est. 1h)*
- [ ] **B3.9** — Implement `POST /api/catering` (Catering Order manual entry). *(Est. 1h)*
- [ ] **B3.10** — Implement `StatusLog` recording untuk setiap create/update manual. *(Est. 1h)*

### Frontend Tasks
- [ ] **F3.1** — Build `DataManagementPage` dengan tab layout (Reset / Simulate / Manual Entry). *(Est. 2h)*
- [ ] **F3.2** — Build `ResetDataModal` (konfirmasi dua tingkat, warning merah, summary data). *(Est. 2h)*
- [ ] **F3.3** — Build `SimulationForm` (days input 1–365, optional start date). *(Est. 1h)*
- [ ] **F3.4** — Build `ReplaceSimulationModal` (konfirmasi jika data simulasi sudah ada). *(Est. 1h)*
- [ ] **F3.5** — Build `ManualEntryForm` untuk Daily Sales (Date, Revenue, Best-selling Menu). *(Est. 1h)*
- [ ] **F3.6** — Build `ManualEntryForm` untuk Monthly Expenses (Category, Amount, Month, Year). *(Est. 1h)*
- [ ] **F3.7** — Build `ManualEntryForm` untuk Catering Orders (Client, Date, Amount, Status, Notes). *(Est. 1h)*
- [ ] **F3.8** — Implement Zod client-side validation untuk semua form. *(Est. 1h)*
- [ ] **F3.9** — Implement toast notifikasi (sukses/error) untuk semua operasi. *(Est. 1h)*
- [ ] **F3.10** — Auto-refresh dashboard setelah reset/simulasi/input manual. *(Est. 1h)*

### Database Tasks
- [ ] **D3.1** — Pastikan transaction atomicity untuk reset & simulation. *(Est. 1h)*

### Testing Tasks
- [ ] **T3.1** — Integration test untuk reset endpoint (verify data deleted). *(Est. 2h)*
- [ ] **T3.2** — Integration test untuk simulation endpoint (verify data created). *(Est. 2h)*
- [ ] **T3.3** — Integration test untuk manual entry endpoints. *(Est. 2h)*
- [ ] **T3.4** — Test edge case: simulation replace confirmation. *(Est. 1h)*

### Documentation Tasks
- [ ] **DOC3.1** — Document simulation algorithm & data generation rules. *(Est. 1h)*

---

## Milestone 4: Financial Features — Expenses & Profit/Loss (Minggu 4)

### Backend Tasks
- [ ] **B4.1** — Implement `GET /api/expenses?month=&year=` (list with filter). *(Est. 1h)*
- [ ] **B4.2** — Implement `PATCH /api/expenses/:id` (update, with StatusLog). *(Est. 1h)*
- [ ] **B4.3** — Implement `GET /api/financials/summary?month=&year=` (revenue − expenses). *(Est. 2h)*
- [ ] **B4.4** — Validasi immutability: reject edit/delete jika report bulanan sudah di-generate. *(Est. 1h)*

### Frontend Tasks
- [ ] **F4.1** — Build `ExpenseList` component (tabel/list pengeluaran). *(Est. 2h)*
- [ ] **F4.2** — Build `ExpenseForm` dengan dropdown kategori (Bahan Baku, Gaji, Operasional, Lainnya). *(Est. 1h)*
- [ ] **F4.3** — Build `ProfitLossCard` (conditional color: green/yellow positive, red negative). *(Est. 1h)*
- [ ] **F4.4** — Integrasi `ProfitLossCard` ke `DashboardPage`. *(Est. 1h)*
- [ ] **F4.5** — Integrasi total pengeluaran ke E-Report agregasi. *(Est. 1h)*

### Database Tasks
- [ ] **D4.1** — Pastikan index `[outlet_id, month, year]` optimal untuk query financial summary. *(Est. 0.5h)*

### Testing Tasks
- [ ] **T4.1** — Integration test untuk expense CRUD. *(Est. 2h)*
- [ ] **T4.2** — Integration test untuk profit/loss calculation accuracy. *(Est. 2h)*
- [ ] **T4.3** — Test immutability constraint. *(Est. 1h)*

### Documentation Tasks
- [ ] **DOC4.1** — Document expense categories & immutability rules. *(Est. 0.5h)*

---

## Milestone 5: Catering — CRUD, Dashboard & E-Report Integration (Minggu 4–5)

### Backend Tasks
- [ ] **B5.1** — Implement `GET /api/catering` (list dengan filter from/to/status). *(Est. 1h)*
- [ ] **B5.2** — Implement `PATCH /api/catering/:id` (update status, validasi workflow maju). *(Est. 1h)*
- [ ] **B5.3** — Implement `DELETE /api/catering/:id` (jika diperlukan, dengan StatusLog). *(Est. 1h)*
- [ ] **B5.4** — Validasi status transition: hanya Pending→Confirmed→Done. *(Est. 1h)*

### Frontend Tasks
- [ ] **F5.1** — Build `CateringList` component dengan badge status (warna berbeda). *(Est. 2h)*
- [ ] **F5.2** — Build `CateringForm` (Client, Date, Amount, Status dropdown, Notes). *(Est. 1h)*
- [ ] **F5.3** — Build `CateringSummaryCard` untuk dashboard (total nilai, count per status). *(Est. 1h)*
- [ ] **F5.4** — Integrasi `CateringSummaryCard` ke `DashboardPage`. *(Est. 1h)*
- [ ] **F5.5** — Integrasi section Catering ke `EReportPage`. *(Est. 2h)*

### Database Tasks
- [ ] **D5.1** — Pastikan index `[outlet_id, order_date]` optimal. *(Est. 0.5h)*

### Testing Tasks
- [ ] **T5.1** — Integration test untuk catering CRUD. *(Est. 2h)*
- [ ] **T5.2** — Integration test untuk status workflow validation (reject backward). *(Est. 2h)*
- [ ] **T5.3** — Frontend test: `CateringList` render & status badge. *(Est. 1h)*

### Documentation Tasks
- [ ] **DOC5.1** — Document catering status workflow. *(Est. 0.5h)*

---

## Milestone 6: Reports — E-Report, PDF & CSV Export (Minggu 5)

### Backend Tasks
- [ ] **B6.1** — Implement `GET /api/reports?from=&to=` (full aggregation: revenue, expenses, profit/loss, top menu, catering). *(Est. 2h)*
- [ ] **B6.2** — Implement `GET /api/reports/export/csv` (generate CSV string). *(Est. 2h)*
- [ ] **B6.3** — Validasi format tanggal & reject invalid ranges. *(Est. 1h)*

### Frontend Tasks
- [ ] **F6.1** — Build `EReportPage` dengan filter tanggal & preview ringkasan. *(Est. 2h)*
- [ ] **F6.2** — Implement PDF export menggunakan `jspdf` + `jspdf-autotable`. *(Est. 3h)*
- [ ] **F6.3** — Implement CSV export dengan UTF-8 BOM & escaped characters. *(Est. 2h)*
- [ ] **F6.4** — Handle empty report state (pesan informatif). *(Est. 1h)*
- [ ] **F6.5** — Print-friendly CSS untuk preview E-Report. *(Est. 1h)*

### Testing Tasks
- [ ] **T6.1** — Integration test untuk report aggregation. *(Est. 2h)*
- [ ] **T6.2** — Test PDF export di Chrome, Firefox, Safari. *(Est. 2h)*
- [ ] **T6.3** — Test CSV export (open in Excel & Google Sheets). *(Est. 1h)*
- [ ] **T6.4** — Test invalid date filter handling. *(Est. 1h)*

### Documentation Tasks
- [ ] **DOC6.1** — Document export format & known limitations. *(Est. 0.5h)*

---

## Milestone 7: AI Integration — Gemini Business Summary (Minggu 6)

### Backend Tasks
- [ ] **B7.1** — Setup `aiService.ts` dengan `@google/generative-ai`. *(Est. 1h)*
- [ ] **B7.2** — Implement `POST /api/ai/summary` (fetch data, build prompt, call Gemini). *(Est. 3h)*
- [ ] **B7.3** — Design prompt template (Bahasa Indonesia) untuk ringkasan & rekomendasi. *(Est. 2h)*
- [ ] **B7.4** — Implement timeout & error handling (quota unavailable, network). *(Est. 1h)*
- [ ] **B7.5** — Mock Gemini response untuk testing. *(Est. 1h)*

### Frontend Tasks
- [ ] **F7.1** — Build `AiSummaryButton` di dashboard (pojok kanan atas). *(Est. 1h)*
- [ ] **F7.2** — Build `AiSummaryCard` / modal untuk menampilkan hasil ringkasan. *(Est. 2h)*
- [ ] **F7.3** — Implement loading spinner saat menunggu respons AI. *(Est. 0.5h)*
- [ ] **F7.4** — Implement error state (pesan ramah, tidak crash UI). *(Est. 1h)*
- [ ] **F7.5** — Disable button & tampilkan pesan jika tidak ada data di periode yang dipilih. *(Est. 0.5h)*

### Testing Tasks
- [ ] **T7.1** — Integration test untuk AI summary endpoint (mocked). *(Est. 2h)*
- [ ] **T7.2** — Test error handling: mock Gemini API failure. *(Est. 1h)*
- [ ] **T7.3** — Test prompt output quality dengan berbagai dataset. *(Est. 2h)*

### Documentation Tasks
- [ ] **DOC7.1** — Document AI prompt template & expected output format. *(Est. 0.5h)*
- [ ] **DOC7.2** — Document Gemini API key setup & quota limits. *(Est. 0.5h)*

---

## Milestone 8: QA & Deployment — Testing, Performance, Security & Launch (Minggu 6–7)

### Backend Tasks
- [ ] **B8.1** — Code review & refactor: hapus console.log, perbaiki typing. *(Est. 2h)*
- [ ] **B8.2** — Final security audit: JWT secret strength, CORS whitelist, rate limits. *(Est. 2h)*
- [ ] **B8.3** — Setup structured logging untuk setiap request. *(Est. 1h)*

### Frontend Tasks
- [ ] **F8.1** — Code splitting & lazy load untuk `EReportPage` & AI module. *(Est. 2h)*
- [ ] **F8.2** — Optimize bundle size (tree shaking, remove unused deps). *(Est. 2h)*
- [ ] **F8.3** — Final responsive check (mobile, tablet, desktop). *(Est. 2h)*

### Database Tasks
- [ ] **D8.1** — Backup strategy & restore test untuk PostgreSQL. *(Est. 1h)*

### Testing Tasks
- [ ] **T8.1** — Run full unit test suite (Vitest backend). *(Est. 2h)*
- [ ] **T8.2** — Run full integration test suite (Supertest). *(Est. 2h)*
- [ ] **T8.3** — Run frontend component tests (React Testing Library). *(Est. 2h)*
- [ ] **T8.4** — Load testing dengan k6 (50 concurrent users, ≤ 500ms). *(Est. 2h)*
- [ ] **T8.5** — Lighthouse CI audit (Performance ≥ 90, ≤ 4s, ≤ 800KB). *(Est. 2h)*
- [ ] **T8.6** — UAT oleh pemilik resto (workflow lengkap). *(Est. 4h)*
- [ ] **T8.7** — Cross-browser testing (Chrome, Firefox, Safari). *(Est. 2h)*

### Documentation Tasks
- [ ] **DOC8.1** — Final update `DEPLOYMENT.md` dengan URL production aktual. *(Est. 0.5h)*
- [ ] **DOC8.2** — Tulis `CHANGELOG.md` versi 1.0.0. *(Est. 1h)*
- [ ] **DOC8.3** — Final update `README.md` (panduan singkat untuk pemilik). *(Est. 1h)*
- [ ] **DOC8.4** — Dokumentasi rollback plan & troubleshooting. *(Est. 1h)*

---

## Cross-Milestone Verification Checklist

### Functional Requirement Coverage
- [ ] **FR-001** — Login dengan username & password.
- [ ] **FR-002** — Validasi hak akses & arah ke Dashboard.
- [ ] **FR-003** — Agregasi omset & menu → Line Chart + Pie Chart.
- [ ] **FR-004** — Generate & suntik data simulasi.
- [ ] **FR-005** — Saring, hitung, & susun E-Report per filter tanggal.
- [ ] **FR-006** — Konversi E-Report ke PDF siap cetak.
- [ ] **FR-007** — Tooltip detail omset & menu terlaris.
- [ ] **FR-008** — Ekspor data ringkasan ke CSV.
- [ ] **FR-009** — Input data transaksi harian manual.
- [ ] **FR-010** — Notifikasi WhatsApp (Future Work — tidak diimplementasikan di v1).
- [ ] **FR-011** — Ringkasan AI otomatis (Google Gemini).
- [ ] **FR-012** — Input pengeluaran bulanan.
- [ ] **FR-013** — Kartu ringkasan laba/rugi.
- [ ] **FR-014** — Input pesanan catering.
- [ ] **FR-015** — Ringkasan catering di dashboard & E-Report.

### Non-Functional Requirement Coverage
- [ ] **NFR-9.1** — Dashboard update latency ≤ 3 detik.
- [ ] **NFR-9.2** — Uptime ≥ 99,5%.
- [ ] **NFR-9.3** — Page load ≤ 4 detik, bundle ≤ 800KB.
- [ ] **NFR-9.4** — API response ≤ 500ms untuk 50 transaksi bersamaan.
- [ ] **NFR-9.5** — Data integrity (atomic StatusLog recording).
- [ ] **NFR-9.6** — AI graceful degradation.

### Data Management Module Coverage
- [ ] **Reset Data** — Dialog konfirmasi, hapus semua data transaksional, auto-refresh, notifikasi.
- [ ] **Run Simulation** — Pilih hari & tanggal mulai, data realistis, konfirmasi replace, regenerasi analytics.
- [ ] **Manual Data Entry** — Daily Sales, Monthly Expenses, Catering Orders forms dengan validasi.

---

*End of Document*
