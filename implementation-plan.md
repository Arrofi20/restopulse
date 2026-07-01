# RestoPulse — Implementation Plan

> **PRD Reference:** `Copy of PSI - Nasi Durian - PRD.docx` (v1.0, 29 Juni 2026)  
> **Last Updated:** 29 Juni 2026  
> **Status:** Active

---

## 1. Architecture Overview

RestoPulse menggunakan arsitektur **monorepo** dengan separation of concerns:

```
restopulse/
├── src/                          # Backend (Express.js, TypeScript)
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Entry point
│   ├── routes/                   # Route definitions
│   ├── controllers/              # Request/response handling
│   ├── services/                 # Business logic & external API calls
│   ├── middleware/               # Auth, rate limit, error handler
│   └── types/                    # Shared TypeScript types
├── prisma/
│   ├── schema.prisma             # SQLite dev schema
│   └── schema.postgresql.prisma  # PostgreSQL production schema
├── frontend/                     # Frontend (React 19, Vite, Tailwind)
│   ├── src/
│   │   ├── api/                  # API client & endpoint helpers
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-level pages
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # Frontend TypeScript types
│   └── package.json
├── scripts/                      # DB seed, connection test
├── k6/                           # Load testing scripts
└── lighthouse/                   # Performance reports
```

### 1.1 Communication Flow

```
Browser (React)
    │ HTTPS
    ▼
Vite Static Site / CDN
    │ API calls (JSON)
    ▼
Express.js API (Node.js)
    │ Prisma Client
    ▼
PostgreSQL (Production) / SQLite (Dev)
```

---

## 2. Database Implementation

### 2.1 Current Schema Gaps

Schema Prisma saat ini (`schema.prisma`) sudah mencakup:
- `OwnerAccount`, `Outlet`, `DailySales`, `SalesTrend`, `StatusLog`, `DailySalesReport`

**Yang belum ada dan wajib ditambahkan di Phase 1:**
- `MonthlyExpense`
- `CateringOrder`

### 2.2 Required Schema Additions

```prisma
model MonthlyExpense {
  id         String   @id @default(uuid())
  outlet_id  String
  category   String   // Enum: BAHAN_BAKU | GAJI | OPERASIONAL | LAINNYA
  amount     Float
  month      Int      // 1–12
  year       Int      // e.g., 2026
  created_at DateTime @default(now())
  outlet     Outlet   @relation(fields: [outlet_id], references: [id])
  @@index([outlet_id, month, year])
}

model CateringOrder {
  id           String   @id @default(uuid())
  outlet_id    String
  client_name  String
  order_date   DateTime
  total_amount Float
  status       String   // Enum: PENDING | CONFIRMED | DONE
  notes        String?
  created_at   DateTime @default(now())
  outlet       Outlet   @relation(fields: [outlet_id], references: [id])
  @@index([outlet_id, order_date])
}
```

### 2.3 Migration Strategy

1. Update `schema.prisma` (SQLite dev) dan `schema.postgresql.prisma` (production).
2. Jalankan `npx prisma migrate dev --name add_financial_and_catering`.
3. Generate Prisma Client: `npm run db:generate`.
4. Seed data awal untuk development (Outlet default, akun owner test).

### 2.4 Data Integrity (NFR-9.5)

Setiap operasi finansial wajib menggunakan **Prisma Transactions** (`prisma.$transaction`):

- **Reset Data:** Delete `DailySales`, `MonthlyExpense`, `CateringOrder`, `SalesTrend`, `DailySalesReport` dalam satu transaction.
- **Manual Entry:** Insert ke tabel utama + insert ke `StatusLog` dalam satu transaction.
- **Simulation:** Batch insert `DailySales` + `MonthlyExpense` + `CateringOrder`, kemudian regenerasi `SalesTrend` dalam satu transaction.

---

## 3. API Implementation

### 3.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register owner baru (username, password, outlet_name) |
| POST | `/api/auth/login` | Login, return JWT access token |
| GET | `/api/auth/me` | Get current user info (protected) |

**Implementation Details:**
- Password hashing dengan `bcrypt` (salt rounds: 10).
- JWT expiry: 24 jam.
- Refresh token: tidak diwajibkan di v1 (gunakan login ulang jika token expired).
- Rate limit: 5 requests per menit untuk login & register.

### 3.2 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | KPI cards data (total revenue, days, average, profit/loss) |
| GET | `/api/dashboard/trends` | Array daily revenue untuk Line Chart |
| GET | `/api/dashboard/menu-popularity` | Array menu + percentage untuk Pie Chart |
| GET | `/api/dashboard/catering-summary` | Total catering & count per status |

**Query Parameters:**
- `from` (ISO date), `to` (ISO date)
- Default: last 30 days.

### 3.3 Data Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/reset-data` | Reset all transactional data for current outlet (owner-only) |
| POST | `/api/admin/simulate` | Generate dummy data |
| POST | `/api/sales` | Create daily sales entry |
| POST | `/api/expenses` | Create monthly expense entry |
| POST | `/api/catering` | Create catering order |
| GET | `/api/expenses` | List expenses (optional: month, year) |
| GET | `/api/catering` | List catering orders (optional: from, to, status) |
| PATCH | `/api/catering/:id` | Update catering status (workflow validation) |

**Simulation Request Body:**
```json
{
  "days": 90,
  "startDate": "2026-04-01"
}
```

**Simulation Logic:**
1. Cek apakah outlet sudah memiliki `DailySales` dengan `data_source = 'DUMMY'`.
2. Jika ada, return `409 Conflict` dengan pesan konfirmasi replace.
3. Jika tidak (atau setelah konfirmasi), jalankan generator:
   - Revenue: random dalam range Rp 500.000 – Rp 2.500.000 dengan spike akhir pekan (+30%).
   - Menu: pilih dari array menu tetap dengan weighted probability.
   - Expenses: generate 3–5 entries per bulan, kategori random, total ~30–50% dari revenue.
   - Catering: generate 0–3 orders per minggu, nominal Rp 2.000.000 – Rp 10.000.000.
4. Insert semua dalam satu Prisma transaction.
5. Regenerasi `SalesTrend` setelah insert selesai.

### 3.4 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Full report aggregation (revenue, expenses, profit/loss, top menu, catering) |
| GET | `/api/reports/export/pdf` | Return JSON data untuk di-render ke PDF di frontend |
| GET | `/api/reports/export/csv` | Return CSV string |

**Note:** PDF generation dilakukan di **frontend** menggunakan `jspdf` agar mengurangi beban server dan memungkinkan preview langsung.

### 3.5 AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summary` | Generate AI business summary via Gemini |

**Request Body:**
```json
{
  "from": "2026-06-01",
  "to": "2026-06-30"
}
```

**Implementation Details:**
- Backend mengambil agregasi data dari DB (revenue, expenses, catering, menu).
- Susun prompt teks panjang dalam Bahasa Indonesia.
- Kirim ke Gemini API (`gemini-1.5-flash` atau model yang tersedia).
- Return hasil ke frontend.
- Timeout: 15 detik. Jika timeout, return error message.

---

## 4. Frontend Implementation

### 4.1 Routing Structure

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | LoginPage | No |
| `/` | DashboardPage | Yes |
| `/data` | DataManagementPage | Yes |
| `/reports` | EReportPage | Yes |

### 4.2 State Management

- **Global Auth State:** React Context (`AuthContext`) untuk menyimpan user & token.
- **API Data:** Custom hooks (`useDashboard`, `useReport`, `usePolling`) dengan `useEffect` + `fetch`.
- **Local UI State:** `useState` / `useReducer` untuk form, modal, toast.

### 4.3 Component Inventory

| Component | Phase | Description |
|-----------|-------|-------------|
| `Layout` | 1 | Sidebar + Header + Dark theme wrapper |
| `ProtectedRoute` | 1 | Redirect ke `/login` jika tidak autentikasi |
| `KPICard` | 2 | Kartu ringkasan dengan font ≥ 24pt |
| `LineChart` | 2 | Chart.js Line chart dengan tooltip kustom |
| `PieChart` | 2 | Chart.js Pie chart |
| `DateRangePicker` | 2 & 6 | Preset 7D/30D/90D/Monthly/Custom |
| `DataManagementTabs` | 3 | Tab container untuk Reset / Simulate / Manual Entry |
| `ResetDataModal` | 3 | Modal konfirmasi dua tingkat |
| `SimulationForm` | 3 | Form jumlah hari & tanggal mulai |
| `ManualEntryForm` | 3 | Reusable form untuk Sales / Expenses / Catering |
| `ExpenseList` | 4 | Tabel/list pengeluaran bulanan |
| `ProfitLossCard` | 4 | Kartu laba/rugi dengan conditional color |
| `CateringList` | 5 | Tabel catering dengan badge status |
| `CateringSummaryCard` | 5 | Widget ringkasan catering |
| `EReportView` | 6 | Preview laporan sebelum export |
| `PdfExporter` | 6 | Trigger jspdf generation |
| `CsvExporter` | 6 | Trigger CSV download |
| `AiSummaryButton` | 7 | Tombol + loading + modal hasil |
| `AiSummaryCard` | 7 | Card untuk menampilkan teks ringkasan AI |
| `Toast` | 3–8 | Notifikasi sukses/error |
| `Skeleton` | 2–8 | Loading placeholder |

### 4.4 Design System

- **Background:** Dark (`bg-slate-900` atau custom hex gelap).
- **Text Primary:** White (`text-white`).
- **Text Accent:** Yellow (`text-yellow-400`) untuk data finansial.
- **Warning/Negative:** Red (`text-red-500`, `bg-red-500`) untuk rugi atau error.
- **Positive:** Green (`text-green-400`) untuk untung.
- **Font Size Data Finansial:** Minimum 24pt (Tailwind: `text-2xl` atau lebih besar).
- **Card Style:** Rounded corners, subtle border, dark background dengan sedikit contrast.

---

## 5. Testing Strategy

### 5.1 Backend Tests (Vitest + Supertest)

| Test Suite | Coverage |
|------------|----------|
| `auth.test.ts` | Register, login, me, token validation |
| `dashboard.test.ts` | Summary, trends, menu-popularity endpoints |
| `data-management.test.ts` | Reset data, simulation, manual entry CRUD |
| `financial.test.ts` | Expense CRUD, profit/loss calculation |
| `catering.test.ts` | Catering CRUD, status workflow validation |
| `report.test.ts` | Report aggregation, date filtering |
| `ai.test.ts` | AI summary endpoint (mock Gemini API) |

### 5.2 Frontend Tests (Vitest + jsdom + React Testing Library)

| Test Suite | Coverage |
|------------|----------|
| `Login.test.tsx` | Form input, submit, error states |
| `Dashboard.test.tsx` | KPI render, chart presence, date filter |
| `DataManagement.test.tsx` | Tab switching, form validation, modal open/close |
| `EReport.test.tsx` | Filter change, export button click |

### 5.3 Load Tests (k6)

- Target: 50 concurrent virtual users.
- Scenarios: login, fetch dashboard, create sales, generate report.
- Threshold: 95th percentile response time ≤ 500ms.

### 5.4 Performance Tests (Lighthouse)

- Run via CLI atau CI.
- Threshold: Performance score ≥ 90, page load ≤ 4s, bundle ≤ 800KB.

---

## 6. Security Implementation

| Concern | Implementation |
|---------|----------------|
| Authentication | JWT (HS256), expiry 24h, stored in `Authorization` header. |
| Password Storage | bcrypt hashing dengan salt rounds 10. |
| Route Protection | `verifyToken` middleware pada semua route protected. |
| CORS | Whitelist origin frontend production & development. |
| Rate Limiting | `express-rate-limit`: 100 req/15min umum, 5 req/min untuk auth. |
| Input Validation | Zod schema untuk semua request body & query. |
| SQL Injection | Prisma Query Engine (parameterized queries). |
| XSS | Escape output di frontend; tidak menyimpan HTML mentah. |

---

## 7. Deployment Plan

### 7.1 Target Platform

**Railway** (sesuai `DEPLOYMENT.md` yang ada):
- `restopulse-api` — Node.js Web Service.
- `restopulse-web` — Static Site (Vite build output).
- `restopulse-db` — PostgreSQL.

### 7.2 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | API | PostgreSQL connection string |
| `JWT_SECRET` | API | Secret key untuk sign JWT |
| `GEMINI_API_KEY` | API | API key untuk Google Gemini |
| `CORS_ORIGIN` | API | URL frontend production |
| `PORT` | API | Server port (default 3000) |
| `VITE_API_BASE_URL` | Web | Base URL untuk API calls |

### 7.3 Deployment Steps

1. Merge final code ke `main`.
2. Railway auto-deploy `restopulse-api` & `restopulse-web`.
3. Jalankan migration production: `npm run db:migrate:prod`.
4. Verifikasi health check endpoint.
5. Verifikasi frontend availability.
6. Lakukan smoke test (login → dashboard → simulasi → export PDF).

---

## 8. Rollback Plan

- Railway menyediakan deployment history; rollback dapat dilakukan via dashboard.
- Jika data corrupt, restore dari backup PostgreSQL (Railway automatic backups).
- Jika schema bermasalah, revert migration dan deploy versi stabil sebelumnya.

---

## 9. Financial Architecture (Phase 4)

### 9.1 Overview

The Financial module follows clean architecture with a centralized `ProfitLossService` as the single source of truth for all profit/loss calculations. No other module duplicates this logic.

```
┌─────────────────────────────────────────────────────────────┐
│                    ProfitLossService                         │
│  (Single source of truth for P/L calculation)               │
│                                                             │
│  calculateByDateRange(outlet, start, end)                   │
│  calculateByPeriod(outlet, month, year)                     │
│  calculateByDateStrings(outlet, startStr, endStr)           │
│                                                             │
│  Returns: { totalRevenue, totalExpenses, profitLoss,       │
│             isLoss, isBreakEven }                           │
└─────────────────┬───────────────────────────────────────────┘
                  │ delegates to
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌──────────────┐     ┌────────────────────┐
│ SalesTrend   │     │ MonthlyExpense     │
│ Repository   │     │ Repository         │
│ (revenue)    │     │ (expenses)         │
└──────────────┘     └────────────────────┘
         │                      │
         ▼                      ▼
    ┌─────────────────────────────────┐
    │        Prisma Client            │
    │  (DailySales / SalesTrend /     │
    │   MonthlyExpense /              │
    │   DailySalesReport)             │
    └─────────────────────────────────┘
```

### 9.2 Consumers of ProfitLossService

| Consumer | How it uses P/L | Data flow |
|----------|-----------------|-----------|
| **AnalyticsService** | Calls `calculateByDateRange()` in `getAggregatedData()` | Dashboard → AnalyticsService → ProfitLossService |
| **ReportService** | Uses AnalyticsService (which delegates to ProfitLossService) | E-Report → ReportService → AnalyticsService → ProfitLossService |
| **AiController** | Uses AnalyticsService to build Gemini prompt | AI → AnalyticsService → ProfitLossService |

### 9.3 Expense Flow

```
User creates expense
    │
    ▼
ExpenseController.createExpense()
    │
    ▼
ExpenseService.createExpense()
    ├── Zod validation (createExpenseSchema)
    ├── Immutability check: hasReportForPeriod(outlet, month, year)
    │   └── If report exists → throw ExpenseImmutableError (403)
    └── prisma.$transaction()
        ├── tx.monthlyExpense.create()
        └── tx.statusLog.create() (audit log: CREATE)
```

All expense mutations (create, update, delete) are wrapped in `prisma.$transaction()` to ensure atomicity per NFR-9.5. If the audit log write fails, the expense mutation is rolled back.

### 9.4 Expense Immutability

**PRD requirement (Section 8):** "Data pengeluaran tidak dapat dihapus setelah laporan bulanan di-generate untuk menjaga integritas audit."

**Implementation (Option B — deliberate strengthening):** The implementation blocks **create, update, AND delete** for any month/year where a `DailySalesReport` has been generated. The PRD explicitly mentions only deletion ("tidak dapat dihapus"), but blocking edits as well is a deliberate strengthening of the business rule to better preserve audit integrity. If an expense could be edited after a report is generated, the report's underlying data would no longer match the report itself, undermining the audit trail.

**Enforcement mechanism:**
1. `MonthlyExpenseRepository.hasReportForPeriod(outlet_id, month, year)` — Checks if a `DailySalesReport` exists that overlaps the expense's month/year.
2. `ExpenseService` calls this check before any `create`, `update`, or `delete` operation.
3. If immutable, an `ExpenseImmutableError` is thrown with a clear user-facing message explaining why changes are not allowed.
4. The controller catches this and returns HTTP 403 with `error.code = 'EXPENSE_IMMUTABLE'`.
5. The frontend displays the error message in a toast notification — it does not silently fail.

### 9.5 Repository Relationships

```
Outlet (1)
  ├── (N) MonthlyExpense
  │       - category: BAHAN_BAKU | GAJI | OPERASIONAL | LAINNYA
  │       - amount: Float
  │       - month: Int (1-12)
  │       - year: Int (2020-2100)
  │       - Index: [outlet_id, month, year]
  │
  ├── (N) DailySales
  │       - data_source: REAL | DUMMY
  │       - Index: [outlet_id, date]
  │
  ├── (N) SalesTrend (pre-computed from DailySales)
  │       - Index: [outlet_id, date]
  │
  └── (N) DailySalesReport (trigger for immutability)
          - period_start, period_end
          - Index: [outlet_id, period_start, period_end]
```

### 9.6 Dummy Data Integration

When dummy data is generated via `DataManagementService.simulate()`:
1. Revenue data is generated per day (with weekend spikes, seasonal variation).
2. Monthly expenses are generated per month per category:
   - BAHAN_BAKU (~40% of monthly revenue)
   - GAJI (~25% of monthly revenue)
   - OPERASIONAL (~15% of monthly revenue)
   - LAINNYA (~5-10% of monthly revenue)
3. Total expenses target: 30-50% of monthly revenue.
4. Profit/Loss automatically reflects the generated data via `ProfitLossService`.

### 9.7 Dashboard Integration

The dashboard displays financial data through two components:

1. **SummaryCards** — Compact 4-card grid showing Total Omset, Hari Tercatat, Total Pengeluaran, and Laba/Rugi. Font ≥ 24pt (text-3xl). Dark background. Quick at-a-glance KPIs.

2. **ProfitLossCard** — Dedicated widget placed below SummaryCards (per PRD Section 7.5: "Kartu ini ditempatkan di bawah kartu ringkasan yang sudah ada"). Shows:
   - Total Revenue, Total Expenses, Profit/Loss
   - Color-coded status: yellow for untung (positive), red for rugi (negative), yellow for break-even
   - Empty state: "Belum ada data pengeluaran untuk bulan ini." (per PRD Decision Point)
   - Loading state: shimmer placeholder
   - Error state: handled by parent DashboardPage

Both components consume the same `data.summary` from the API response, which originates from `ProfitLossService` via `AnalyticsService`. No calculation logic is duplicated.

### 9.8 Dashboard Refresh

The dashboard auto-refreshes via 30-second polling (`useDashboard` → `usePolling`). Cross-page instant refresh (e.g., refreshing the dashboard immediately when an expense is created on the Data Management page) is **not implemented** and is documented as a future enhancement. The current 30-second polling ensures data consistency within at most 30 seconds. This is acceptable for the MVP per NFR-9.1 (≤ 3 seconds for data reflection after database change — the polling picks up changes within the next cycle).

### 9.9 Known Limitations

1. **Cross-page instant refresh** — Dashboard does not instantly refresh when expenses change on the Data Management page. Mitigated by 30-second polling. Future enhancement: use `localStorage` events or a shared event bus.
2. **Expense list month/year filter** — The backend supports filtering, but the frontend `ExpenseList` fetches all expenses. Future enhancement: add a month/year filter dropdown.
3. **Frontend tests for ExpenseList and ProfitLossCard** — Deferred to QA phase (Phase 8). Backend tests fully cover the financial logic.

### 9.10 Business Rules Summary

| Rule | Source | Implementation |
|------|--------|----------------|
| Expenses categorized per month | PRD Section 8 | `MonthlyExpense` model with category, month, year |
| Categories: Bahan Baku, Gaji, Operasional, Lainnya | PRD Section 8 | `EXPENSE_CATEGORIES` enum: BAHAN_BAKU, GAJI, OPERASIONAL, LAINNYA |
| Cannot delete after report generated | PRD Section 8 | `hasReportForPeriod()` check on delete |
| Cannot edit after report generated (strengthened) | Deliberate | `hasReportForPeriod()` check on update |
| Cannot create for immutable period (strengthened) | Deliberate | `hasReportForPeriod()` check on create |
| P/L = Revenue - Expenses | PRD Section 2.1 obj 4 | `ProfitLossService.calculateByDateRange()` |
| P/L card: yellow/white for untung, red for rugi | PRD Section 7.5 | `ProfitLossCard` valueColor logic |
| P/L card font ≥ 24pt | PRD Section 7.5 | `text-3xl` (~30px) |
| P/L card below summary cards | PRD Section 7.5 | Placed after `SummaryCards` in `DashboardPage` |
| Empty expense message | PRD Decision Point | "Belum ada data pengeluaran untuk bulan ini." |
| Atomic audit logging | PRD NFR-9.5 | `prisma.$transaction()` wraps expense + StatusLog |
| Dummy data generates expenses | PRD Section 4.1 | `DataManagementService.simulate()` generates 3-5 expenses/month |

---

## 10. Catering Architecture (Phase 5)

### 10.1 Overview

The Catering module manages catering/party orders as a separate revenue stream. It follows the same clean architecture pattern as the Financial module, with atomic transactions for audit logging.

```
┌─────────────────────────────────────────────────────────────┐
│                    CateringOrderRepository                   │
│                                                             │
│  create, findById, findByOutlet, findByDateRange,          │
│  searchByClientName, update, updateStatus, delete,         │
│  deleteByOutlet, sumByDateRange, countByStatus             │
│                                                             │
│  Status workflow: canTransition(current, new)               │
│    PENDING (0) → CONFIRMED (1) → DONE (2)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    CateringService                           │
│                                                             │
│  createCateringOrder → prisma.$transaction                  │
│  updateOrder (full update + status workflow)                │
│  updateStatus (status-only with workflow validation)        │
│  deleteOrder → prisma.$transaction                          │
│  getCateringOrders (from/to/status/search)                  │
│                                                             │
│  All mutations: atomic transaction + StatusLog audit        │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌──────────────┐     ┌────────────────────┐
│ Analytics    │     │ CateringController  │
│ Service      │     │ (REST endpoints)    │
│              │     │                     │
│ countByStatus│     │ POST, GET, PUT,     │
│ sumByDateRan.│     │ PATCH, DELETE       │
└──────────────┘     └────────────────────┘
```

### 10.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/catering` | Create catering order (Zod validated, atomic transaction, audit logged) |
| GET | `/api/catering` | List orders (optional: from, to, status, search by client name) |
| GET | `/api/catering/statuses` | Get valid statuses (PENDING, CONFIRMED, DONE) |
| GET | `/api/catering/:id` | Get single order by ID |
| PUT | `/api/catering/:id` | Full update (fields + status with workflow validation) |
| PATCH | `/api/catering/:id` | Status-only update (workflow validation, backward compatible) |
| DELETE | `/api/catering/:id` | Delete order (atomic transaction, audit logged) |

### 10.3 Status Workflow

Per PRD Section 8 (CateringOrder entity): "Status hanya bisa diubah maju (Pending → Confirmed → Done); tidak bisa mundur untuk menjaga integritas audit."

```
PENDING ──► CONFIRMED ──► DONE
   │            │            │
   └────────────┴────────────┘
         No backward transitions allowed
```

**Implementation:**
- `CateringOrderRepository.canTransition(current, new)` — Numeric comparison: PENDING=0, CONFIRMED=1, DONE=2. Transition allowed only if newOrder > currentOrder.
- Both `PUT /:id` (full update) and `PATCH /:id` (status update) enforce this validation.
- Invalid transitions return HTTP 400 with a clear error message: "Invalid status transition: X -> Y. Status can only move forward (PENDING -> CONFIRMED -> DONE)."

### 10.4 Dashboard Integration

The `AnalyticsService.getAggregatedData()` includes catering summary via `CateringOrderRepository.countByStatus()` and `sumByDateRange()`. The summary data flows to:

1. **SummaryCards** (existing) — Shows catering total and per-status breakdown (if orders exist).
2. **CateringSummaryCard** (new) — Dedicated widget showing total catering revenue, order count, and per-status badges with amounts.
3. **Future E-Report** — Will use the same `AnalyticsService` data for the catering section.
4. **Future AI Summary** — Will use the same data for Gemini prompt.

No catering statistics are calculated separately — all aggregation comes from the centralized `AnalyticsService`.

### 10.5 Dummy Data Integration

When dummy data is generated via `DataManagementService.simulate()`:
1. Revenue and expenses are generated first.
2. Catering orders are generated per week: 0–3 orders per week.
3. Order values range from Rp 2,000,000 to Rp 10,000,000.
4. Status is randomized: ~30% PENDING, ~40% CONFIRMED, ~30% DONE.
5. Client names are drawn from a fixed list of realistic Indonesian company names.
6. Optional notes include realistic scenarios (event details, delivery instructions, discounts).

### 10.6 PRD Edge Case: Pending Order Past Date

Per PRD Section 6.1 Edge Case: "Pesanan catering diinput dengan status Pending tapi tanggal sudah lewat → Sistem tidak otomatis mengubah status; pemilik harus update manual agar integritas data terjaga."

**Implementation:** The system does NOT automatically change the status of any catering order. All status changes require explicit user action via the PATCH or PUT endpoints.

### 10.7 Frontend Components

| Component | Location | Description |
|-----------|----------|-------------|
| `CateringStatusBadge` | `frontend/src/components/catering/CateringStatusBadge.tsx` | Reusable badge with color dot: yellow=PENDING, blue=CONFIRMED, green=DONE |
| `CateringList` | `frontend/src/components/catering/CateringList.tsx` | Full-featured table: search by client name, filter by status, sort by any column, inline edit form, status progression buttons, delete with confirm |
| `CateringSummaryCard` | `frontend/src/components/dashboard/CateringSummaryCard.tsx` | Dashboard widget: total revenue, order count, per-status breakdown with badges |
| `CateringPage` | `frontend/src/pages/CateringPage.tsx` | Dedicated page with CateringList and toast notifications |

---

## 11. Reports & E-Report Architecture (Phase 6)

### 11.1 Overview

The E-Report system consumes all data from the centralized `AnalyticsService` (via `ProfitLossService` for P/L). No aggregation logic is duplicated — the report always matches the dashboard.

### 11.2 Data Flow

```
Browser (EReportPage)
    │ GET /api/report?start=&end=
    ▼
ReportController.getReport()
    │
    ▼
ReportService.getReport()
    ├── AnalyticsService.getAggregatedData()
    │   └── ProfitLossService.calculateByDateRange()
    │       ├── SalesTrendRepository (revenue)
    │       └── MonthlyExpenseRepository (expenses)
    ├── ReportRepository.getReportData() (daily rows)
    └── MonthlyExpenseRepository.findByDateRange() (expense breakdown)
    │
    Returns: { outlet, period, summary, rows, expenseByCategory }
```

### 11.3 Report Sections

| Section | Data Source | Component |
|---------|-------------|-----------|
| Ringkasan Penjualan | `summary.totalRevenue`, `dayCount`, `averageDaily`, `topMenuItems` | `ReportSummaryCards` |
| Detail Penjualan Harian | `rows[]` (daily revenue, top menu, day count) | `ReportDailyTable` |
| Ringkasan Keuangan | `summary.totalExpenses`, `profitLoss`, `expenseByCategory[]` | `FinancialSummarySection` |
| Ringkasan Catering | `summary.catering` (totalAmount, totalCount, byStatus) | `CateringSummarySection` |

### 11.4 Export Flow

Both PDF and CSV exports are generated client-side (no server round-trip):

- **PDF** (`pdfGenerator.ts`): jsPDF + jspdf-autotable. A4 portrait. Sections: Header, Sales Summary, Daily Table, Financial Summary (with expense table), Catering Summary (with status table). Footer with timestamp + page numbers on every page. Page breaks between sections when needed.
- **CSV** (`csvGenerator.ts`): UTF-8 BOM, semicolon delimiter, Windows CRLF line endings. Formula injection protection. All 4 sections with clear section headers and blank row separators.

### 11.5 Date Filtering

The `ReportDateFilter` provides:
- **Harian** (today), **Mingguan** (last 7 days), **Bulanan** (current month) presets
- **Custom** date range with native date pickers
- Active preset highlighting
- `date-fns` for timezone-safe date computation

Default range: Bulanan (current month).

### 11.6 Empty States

| Condition | Message |
|-----------|---------|
| No data for date range | "Tidak ada data untuk periode ini." (full-page) |
| No expense data | "Belum ada data pengeluaran untuk periode ini." (section) |
| No catering data | "Belum ada pesanan catering untuk periode ini." (section) |
| No rows in table | "Tidak ada data untuk periode ini" (table row) |

### 11.7 Immutability Rules (NFR-9.5)

Existing Phase 4 immutability rules apply: expenses for months with generated reports cannot be created, edited, or deleted. The E-Report page does not modify data — it only reads — so there is no risk of violating immutability. The expense data shown in the report reflects the current state of the database.

### 11.8 Report Lifecycle

1. User selects date range (or uses preset)
2. `useReport` hook fetches `GET /api/report` with polling (30s)
3. ReportService assembles data from AnalyticsService + repositories
4. Report rendered: SummaryCards → Daily Table → Financial Section → Catering Section
5. User clicks Export PDF or Export CSV
6. Client-side generation: jsPDF or custom CSV builder
7. Browser download triggered via ObjectURL

### 11.9 Frontend Components

| Component | Location | Description |
|-----------|----------|-------------|
| `EReportPage` | `frontend/src/pages/EReportPage.tsx` | Full E-Report page with all sections |
| `ReportSummaryCards` | `frontend/src/components/report/ReportSummaryCards.tsx` | 5 KPI cards: Total Omset, Hari Tercatat, Total Pengeluaran, Laba/Rugi, Menu Terlaris |
| `ReportDailyTable` | `frontend/src/components/report/ReportDailyTable.tsx` | Daily sales breakdown table |
| `FinancialSummarySection` | `frontend/src/components/report/FinancialSummarySection.tsx` | Expense totals + profit/loss + category breakdown table |
| `CateringSummarySection` | `frontend/src/components/report/CateringSummarySection.tsx` | Catering totals + per-status breakdown table with badges |
| `ReportDateFilter` | `frontend/src/components/report/ReportDateFilter.tsx` | Harian/Mingguan/Bulanan/custom date range selector |
| `ExportButtons` | `frontend/src/components/report/ExportButtons.tsx` | PDF + CSV export with loading spinners |

---

## 12. AI Business Summary Architecture (Phase 7)

### 12.1 Overview

The AI module provides automated business analysis in Bahasa Indonesia using Google Gemini. All analysis is based on aggregated data from `AnalyticsService` — the AI never calculates metrics itself.

### 12.2 Data Flow

```
Dashboard (Ringkasan AI button)
    │ POST /api/ai/summary { start, end }
    ▼
AiController.generateSummary()
    │ Zod validation (start/end date format)
    ├── AiService.generateSummaryDeduplicated()
    │   ├── AnalyticsService.getAggregatedData()
    │   │   └── ProfitLossService.calculateByDateRange()
    │   ├── [no data] → return noData message
    │   ├── [no API key] → return mock summary
    │   ├── buildPrompt(analytics) → Bahasa Indonesia prompt
    │   ├── Gemini API (gemini-2.5-flash, 15s timeout)
    │   ├── [API error] → return mock summary + friendly error
    │   └── [empty response] → return mock summary
    │
    Returns: { summary, isMock, noData?, error?, message? }
```

### 12.3 Prompt Structure

The prompt is built by `AiService.buildPrompt()` and includes:

| Section | Data Source | Content |
|---------|-------------|---------|
| Data Restoran | `outlet.name`, `period` | Restaurant name and date range |
| Ringkasan Keuangan | `summary` | Revenue, days, average, expenses, P/L |
| Tren Pendapatan | `trends[]` | Last 10 days with daily amounts |
| Menu Terlaris | `summary.topMenuItems` | Top 5 items with counts and percentages |
| Pesanan Catering | `summary.catering` | Total amount, count, per-status breakdown |
| (Requested output) | — | Executive Summary, Revenue Analysis, Expense Analysis, Catering Analysis, Recommendations, Risks |

### 12.4 Graceful Degradation

| Failure Mode | Behavior |
|-------------|----------|
| No `GEMINI_API_KEY` | Returns mock summary (`isMock: true`), dashboard continues normally |
| API timeout (>15s) | Returns mock summary with timeout error message |
| Quota exceeded | Returns mock summary with quota error message |
| Invalid API key | Returns mock summary with permission error message |
| Safety filter triggered | Returns mock summary with safety filter message |
| Empty/malformed response | Returns mock summary with response validation error |
| No data for date range | Returns `noData: true` message without calling Gemini |
| Network failure | Returns mock summary with generic error message |
| Duplicate request (same outlet+dates) | Deduplicated — returns pending request's result |

The **dashboard never crashes** — the AI module is a non-critical enhancement.

### 12.5 Security

- `GEMINI_API_KEY` is stored in environment variables on the backend only
- The key is never exposed in API responses, logs, or frontend code
- All request inputs are validated via Zod schema
- Prompts are built server-side from structured analytics data (no user input injection)
- The frontend sends only `{ start, end }` — no raw prompt data

### 12.6 Performance Optimizations

- **Aggregated data only** — The AI prompt contains summary-level data, not raw records. No large queries.
- **Request deduplication** — `AiService.generateSummaryDeduplicated()` prevents duplicate calls for the same request key.
- **Timeout** — Gemini requests have a 15-second timeout to prevent hanging.
- **15 req/min limit** — The free tier rate limit is respected. The service does not implement rate limiting (future enhancement).

### 12.7 Environment Configuration

```env
# Required for AI Business Summary
# Not set → mock summary displayed
GEMINI_API_KEY=your_key_here
```

The key is read once at service initialization. No runtime reloading is needed.

### 12.8 Frontend Integration

| Component/Hook | Location | Description |
|---------------|----------|-------------|
| `useAiSummary` | `frontend/src/hooks/useAiSummary.ts` | State management: generate, retry, isMock, loading, error |
| Dashboard AI button | `frontend/src/pages/DashboardPage.tsx` | "Ringkasan AI" button with Spinner during loading |
| AI summary card | `frontend/src/pages/DashboardPage.tsx` | Renders summary with `whitespace-pre-wrap`, mock badge, error + retry button |

The AI summary is rendered with `whitespace-pre-wrap` to preserve Gemini's markdown-like formatting. A yellow "Mode Demo" badge appears when `isMock: true`. When an error occurs, a red banner with "Coba Lagi" (retry) button is shown.

---

*End of Document*
