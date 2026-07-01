# RestoPulse — Development Roadmap

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js, TypeScript (CommonJS) |
| **ORM** | Prisma (PostgreSQL production, SQLite dev) |
| **Auth** | bcrypt, jsonwebtoken (JWT) |
| **Validation** | Zod |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Chart.js, react-chartjs-2 |
| **PDF Export** | jspdf, jspdf-autotable |
| **AI** | Google Generative AI (`@google/generative-ai`) |
| **Testing** | Vitest (backend & frontend), Supertest (API), k6 (load), jsdom (DOM) |
| **Linting** | Oxlint |
| **Deployment** | Railway (Node.js + PostgreSQL + Static Site) |

---

## 2. Development Phases

### Phase 1 — Foundation (Week 1)

**Architecture Goals:**
- Monorepo: `backend/` (root) + `frontend/` (subfolder).
- Clean separation: routes → controllers → services → Prisma client.
- Environment-based configuration (`.env.example` → actual `.env`).

**Technical Tasks:**
1. Finalize Prisma schema untuk semua entitas (tambahkan `MonthlyExpense` & `CateringOrder` yang belum ada di schema saat ini).
2. Setup migration PostgreSQL & SQLite fallback dev.
3. Implement auth middleware (`verifyToken`) dan rate limiter.
4. Build health check endpoint (`GET /health`).
5. Setup frontend routing (`react-router-dom`) dengan protected routes.
6. Setup Tailwind dark theme (background gelap, teks putih/kuning, indikator merah).
7. Setup API client layer di frontend (fetch wrapper dengan base URL & token header).

**Acceptance Criteria:**
- `npm run dev` menjalankan backend + frontend secara bersamaan (atau terpisah dengan instruksi jelas).
- Endpoint `/api/auth/register` dan `/api/auth/login` merespons dengan benar.
- Halaman login dan layout dasar dapat diakses di browser.

---

### Phase 2 — Dashboard (Week 2)

**Technical Tasks:**
1. API agregasi: `GET /api/dashboard/summary?from=&to=` → total revenue, transaction count, average, top menu.
2. API trend: `GET /api/dashboard/trends?from=&to=` → array daily revenue untuk Line Chart.
3. API menu popularity: `GET /api/dashboard/menu-popularity?from=&to=` → array label + value untuk Pie Chart.
4. Komponen `LineChart` (Chart.js) dengan gradient fill dan responsive resize.
5. Komponen `PieChart` (Chart.js) dengan legend interaktif.
6. Komponen `KPICard` (Total Omset, Hari Tercatat, Rata-rata) dengan font ≥ 24pt.
7. Implementasi tooltip kustom (Chart.js tooltip callback) untuk menampilkan nominal & nama menu.
8. Polling mechanism di dashboard (misal: `setInterval` 30 detik) atau SWR-like caching untuk auto-refresh.
9. Loading skeleton & empty state komponen.

**Acceptance Criteria:**
- Dashboard menampilkan data agregasi dalam ≤ 3 detik setelah data tersedia (NFR-9.1).
- Tooltip muncul saat hover/tap pada titik grafik.
- Page load dashboard ≤ 4 detik pada koneksi 4G (NFR-9.3).

---

### Phase 3 — Data Management (Week 3)

**Technical Tasks:**
1. **Reset Data:**
   - API `POST /api/admin/reset-data` (protected, owner-only).
   - Prisma transaction: delete `DailySales`, `MonthlyExpense`, `CateringOrder`, `SalesTrend`, `DailySalesReport` untuk outlet terkait.
   - Invalidate cache analytics (hapus data di `SalesTrend` & `DailySalesReport`).
   - Frontend: tombol merah dengan modal konfirmasi dua tingkat.
   - Notifikasi toast sukses/gagal.

2. **Run Simulation:**
   - API `POST /api/admin/simulate` dengan body `{ days: number, startDate?: string }`.
   - Generator data realistis:
     - Revenue: distribusi normal sekitar nilai rata-rata restoran kecil (misal: Rp 500K–2.5M/hari, dengan variasi akhir pekan lebih tinggi).
     - Menu: pilih dari daftar menu tetap (Nasi Goreng, Mie Ayam, Es Teh, Kopi, dll.) dengan probabilitas weighted.
     - Expenses: generate 3–5 kategori per bulan dengan total ~30–50% dari revenue.
     - Catering: generate 0–3 order per minggu dengan nominal lebih besar.
   - Jika `DailySales` dengan `data_source = 'DUMMY'` sudah ada → tampilkan konfirmasi replace.
   - Regenerasi `SalesTrend` otomatis setelah simulasi.

3. **Manual Data Entry:**
   - API `POST /api/sales` (Daily Sales).
   - API `POST /api/expenses` (Monthly Expenses).
   - API `POST /api/catering` (Catering Orders).
   - Frontend: tabbed interface (Sales / Expenses / Catering) dengan form Zod-validated.
   - Setiap input mencatat `StatusLog` untuk audit.

**Acceptance Criteria:**
- Reset data menghapus semua data transaksional & cache dalam satu transaksi atomik.
- Simulasi 365 hari selesai dalam ≤ 10 detik.
- Form manual entry menampilkan error validasi real-time dan notifikasi sukses.

---

### Phase 4 — Financial Features (Week 4)

**Technical Tasks:**
1. API `GET /api/expenses?month=&year=` & `POST /api/expenses` & `PATCH /api/expenses/:id`.
2. API `GET /api/financials/summary?month=&year=` → total revenue, total expense, net profit/loss.
3. Komponen `ProfitLossCard` di dashboard dengan conditional styling (positive = green/yellow, negative = red).
4. Form input pengeluaran dengan dropdown kategori (Bahan Baku, Gaji, Operasional, Lainnya).
5. Integrasi total pengeluaran ke E-Report agregasi.

**Acceptance Criteria:**
- Kartu laba/rugi menampilkan selisih akurat antara pemasukan & pengeluaran bulan yang dipilih.
- Indikator warna merah muncul saat rugi (nilai negatif).
- Data pengeluaran immutable setelah report bulanan di-generate.

---

### Phase 5 — Catering (Week 4–5)

**Technical Tasks:**
1. API `GET|POST|PATCH|DELETE /api/catering`.
2. Validasi status workflow: hanya transisi maju yang diperbolehkan (`Pending` → `Confirmed` → `Done`).
3. Komponen `CateringList` dengan badge status (warna berbeda per status).
4. Dashboard widget: `CateringSummaryCard` (total nilai, count per status).
5. E-Report section: tabel catering terpisah + total nominal catering masuk ke grand total.

**Acceptance Criteria:**
- Status catering tidak bisa diubah mundur.
- Nominal catering tercatak di E-Report sebagai section terpisah.
- Dashboard memperbarui ringkasan catering dalam ≤ 3 detik setelah perubahan.

---

### Phase 6 — Reports (Week 5)

**Technical Tasks:**
1. API `GET /api/reports?from=&to=` → agregasi lengkap (revenue, expenses, profit/loss, top menu, catering).
2. PDF Export: gunakan `jspdf` + `jspdf-autotable` untuk generate tabel ringkasan dan detail.
3. CSV Export: generate CSV string di frontend atau backend dengan header yang sesuai.
4. Date filter component dengan preset (7D, 30D, 90D, Monthly, Custom).
5. E-Report preview page dengan layout print-friendly.
6. Handle edge case: data tidak ditemukan → tampilkan pesan informatif.

**Acceptance Criteria:**
- PDF terunduh utuh tanpa rusak layout (≥ 98% success rate).
- CSV dapat dibuka langsung di Excel/Google Sheets.
- Filter tanggal menolak input invalid dengan pesan error yang jelas.

---

### Phase 7 — AI Integration (Week 6)

**Technical Tasks:**
1. Service layer `aiService.ts` yang menerima aggregated dashboard data dan membangun prompt untuk Gemini.
2. API `POST /api/ai/summary` dengan body `{ from, to }`. Backend mengambil data dari DB, susun prompt, panggil Gemini API.
3. Prompt template (Bahasa Indonesia):
   - Ringkasan tren omset harian (naik/turun, hari teramai).
   - Menu terlaris & menu kurang laku.
   - Total pengeluaran & kategori terbesar.
   - Status laba/rugi.
   - Ringkasan pesanan catering.
   - 2–3 rekomendasi bisnis singkat.
4. Frontend: tombol "Ringkasan AI" di dashboard, modal/card hasil, loading spinner, error message.
5. Graceful degradation: jika Gemini API gagal (quota/network), tampilkan pesan error ramah tanpa crash UI.

**Acceptance Criteria:**
- Ringkasan AI muncul dalam ≤ 10 detik (tergantung latency Gemini).
- Jika API gagal, dashboard tetap berfungsi normal.
- Output dalam Bahasa Indonesia yang mudah dipahami pemilik restoran.

---

### Phase 8 — QA & Deployment (Week 6–7)

**Technical Tasks:**
1. **Testing:**
   - Unit tests untuk utility functions, Zod schemas, dan service layers.
   - Integration tests untuk semua API endpoints (auth, CRUD, agregasi).
   - Frontend component tests (React Testing Library + Vitest).
2. **Load Testing:**
   - Script k6 untuk mensimulasikan 50 transaksi bersamaan, memastikan response ≤ 500ms (NFR-9.4).
3. **Performance:**
   - Lighthouse CI untuk memantau page load & bundle size.
   - Code splitting & lazy loading untuk E-Report dan AI module.
4. **Security:**
   - Audit JWT implementation (secret strength, expiry).
   - CORS whitelist validation.
   - Rate limiting pada endpoint sensitif (login, export, simulasi).
   - Input sanitization untuk mencegah XSS/SQL injection (Prisma query builder sudah aman).
5. **Deployment:**
   - Backend: Railway Web Service (`restopulse-api`).
   - Frontend: Railway Static Site (`restopulse-web`) atau Vercel/Netlify.
   - Database: Railway PostgreSQL (`restopulse-db`).
   - Environment variables: `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL`, `GEMINI_API_KEY`.
   - Health check & monitoring.

**Acceptance Criteria:**
- Semua test case untuk FR Must Have lolos.
- Load test 50 transaksi sukses dengan response time ≤ 500ms.
- Page load dashboard ≤ 4 detik & bundle ≤ 800KB.
- UAT oleh pemilik resto: workflow login → simulasi → dashboard → input data → E-Report → export PDF berjalan lancar.

---

## 3. Database Schema Evolution

**Current State (SQLite dev):**
- `OwnerAccount`, `Outlet`, `DailySales`, `SalesTrend`, `StatusLog`, `DailySalesReport` — sudah ada.
- `MonthlyExpense` & `CateringOrder` — **belum ada**, harus ditambahkan di Phase 1.

**Required Additions:**
```prisma
model MonthlyExpense {
  id         String   @id @default(uuid())
  outlet_id  String
  category   String   // Bahan Baku | Gaji | Operasional | Lainnya
  amount     Float
  month      Int
  year       Int
  created_at DateTime @default(now())
  outlet     Outlet   @relation(fields: [outlet_id], references: [id])
  @@index([outlet_id, month, year])
}

model CateringOrder {
  id          String   @id @default(uuid())
  outlet_id   String
  client_name String
  order_date  DateTime
  total_amount Float
  status      String   // Pending | Confirmed | Done
  notes       String?
  created_at  DateTime @default(now())
  outlet      Outlet   @relation(fields: [outlet_id], references: [id])
  @@index([outlet_id, order_date])
}
```

---

## 4. API Design Principles

- **RESTful:** nouns in paths, HTTP verbs for actions.
- **Versioning:** prefix `/api/v1` (or `/api` jika v1 saja).
- **Auth:** `Authorization: Bearer <token>` header.
- **Validation:** Zod schema untuk semua request body & query params.
- **Error Format:** consistent JSON `{ success: false, error: string, details?: object }`.
- **Success Format:** `{ success: true, data: object|array, meta?: object }`.

---

## 5. Frontend Architecture

```
frontend/src/
  main.tsx                 # Entry point
  App.tsx                  # Router & global providers
  api/                     # API client & endpoints
  components/              # Reusable UI (KPICard, ChartCard, Modal, Toast)
  pages/                   # Route-level components
    Login.tsx
    Dashboard.tsx
    DataManagement.tsx     # Reset, Simulate, Manual Entry tabs
    EReport.tsx
  hooks/                   # Custom hooks (useAuth, useDashboard, usePolling)
  stores/                  # Global state (React Context or Zustand if needed)
  types/                   # TypeScript interfaces
```

---

## 6. Monitoring & Observability

- **Health Check:** `GET /health` → `{ status: "ok", timestamp, version, environment }`.
- **Logs:** structured logging untuk setiap request (method, path, status, duration).
- **Error Tracking:** log error stack trace untuk debugging.
- **Performance:** metric response time di setiap endpoint (middleware).

---

*End of Document*
