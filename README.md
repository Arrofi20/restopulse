# RestoPulse

Sistem informasi dasbor analitik dan laporan digital (E-Report) berbasis web untuk pemilik restoran skala kecil-menengah. Mengubah data penjualan harian menjadi grafik interaktif, mencatat pengeluaran bulanan dan pesanan catering, menghasilkan laporan keuangan digital siap cetak, serta memberikan ringkasan bisnis otomatis berbasis AI (Google Gemini).

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | Register, login, JWT session management |
| **Dashboard Analytics** | KPI cards (revenue, expenses, profit/loss), line chart (daily trends), pie chart (menu popularity), auto-refresh, date range filters |
| **Data Management** | Reset all data, run dummy data simulation (realistic generator), manual data entry (sales, expenses, catering) |
| **Financial Management** | Monthly expense CRUD, expense list with sorting, profit/loss calculation, expense immutability after report generation |
| **Catering Management** | Catering order CRUD, forward-only status workflow (Pending → Confirmed → Done), search by client, status badges |
| **E-Report** | Multi-section report (sales, financial, catering), date range presets (daily/weekly/monthly/custom) |
| **PDF Export** | A4 portrait, multi-page with auto page breaks, includes all report sections |
| **CSV Export** | UTF-8 BOM, semicolon-delimited, formula injection protection |
| **AI Business Summary** | Google Gemini-powered analysis in Bahasa Indonesia (executive summary, revenue, expenses, catering, recommendations, risks) |
| **Gemini Settings** | Web UI for API key management (encrypted storage), model selection, connection test |
| **Responsive UI** | Dark theme, mobile-friendly, 44px touch targets, keyboard accessible |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Chart.js, react-chartjs-2, jspdf |
| **Backend** | Node.js, Express.js, TypeScript |
| **ORM** | Prisma 7 (SQLite for dev, PostgreSQL for production) |
| **Auth** | bcrypt, jsonwebtoken (JWT) |
| **Validation** | Zod |
| **AI** | Google Generative AI (gemini-2.5-flash / gemini-2.5-pro) |
| **Testing** | Vitest, Supertest, React Testing Library, k6 |
| **Deployment** | Railway (Web Service + PostgreSQL + Static Site) |

---

## Installation

```bash
git clone <repository-url>
cd restopulse
npm install
npm run dev
```

Both backend (port 3000) and frontend (port 5173) start with a single command.

What happens automatically on `npm install`:
- Installs all backend + frontend dependencies via npm workspaces
- Generates Prisma Client (`postinstall` script)

What happens automatically on `npm run dev`:
- Creates `.env` from `.env.example` if missing
- Applies database migrations (creates SQLite dev.db)
- Starts both backend and frontend concurrently

No manual `prisma generate`, `prisma migrate`, or `cd frontend && npm install` required.

---

## Environment Variables

Copy `.env.example` to `.env` (auto-created on first `npm run dev`):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite path (dev) or PostgreSQL URL (production) |
| `JWT_SECRET` | Yes | (fallback warning) | Secret for JWT token signing (≥32 chars) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Frontend URL for CORS |
| `PORT` | No | `3000` | Backend server port |
| `GEMINI_API_KEY` | No | — | Google Gemini API key (optional, can also be configured via Settings page) |
| `VITE_API_BASE_URL` | No | `/api` | API base URL for frontend (set to backend URL in production) |

---

## Project Structure

```
restopulse/
├── src/                          # Backend (Express.js + TypeScript)
│   ├── app.ts                    # Express app setup + route wiring
│   ├── server.ts                 # Entry point, port, env warnings
│   ├── controllers/              # Request/response handling (10 controllers)
│   ├── services/                 # Business logic (11 services)
│   ├── repositories/             # Database access layer (11 repositories)
│   ├── routes/                   # Route definitions (10 route files)
│   ├── middleware/                # Auth, error handler, rate limiter
│   ├── validation/               # Zod schemas (auth, sales, data mgmt)
│   ├── lib/                      # Prisma client, JWT utilities
│   └── __tests__/                # Backend tests (11 files, 118 tests)
├── frontend/                     # Frontend (React 19 + Vite + Tailwind)
│   └── src/
│       ├── pages/                # 8 page components
│       ├── components/           # Reusable UI (dashboard, report, catering, expense, layout, ui)
│       ├── hooks/                # 7 custom hooks
│       ├── types/                # 5 type definition files
│       ├── lib/                  # PDF/CSV generators, chart config, formatter
│       ├── api/                  # API client (fetch wrapper with JWT)
│       ├── contexts/             # Auth context
│       └── __tests__/            # Frontend tests (7 files, 32 tests)
├── prisma/                       # Database
│   ├── schema.prisma             # SQLite dev schema (10 models)
│   ├── schema.postgresql.prisma  # PostgreSQL production schema
│   └── migrations/               # 4 migrations
├── scripts/                      # Utility scripts (seed, env setup, health check)
├── .planning/                    # Project planning documents
│   └── archive/                  # Historical v1.0 planning artifacts
├── k6/                           # Load testing script
└── package.json                  # Root package (npm workspaces)
```

---

## Development

```bash
npm run dev          # Start backend + frontend concurrently
npm run build        # Compile TypeScript (backend)
npm test             # Run backend + frontend tests (150 total)

# Backend only
npx vitest run --config vitest.config.ts

# Frontend only
cd frontend && npx vitest run
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/dashboard` | Dashboard analytics (aggregated data) |
| POST | `/api/sales` | Create daily sales entry |
| GET | `/api/report` | Generate E-Report |
| POST | `/api/admin/reset-data` | Reset all transactional data |
| POST | `/api/admin/simulate` | Generate dummy data |
| POST | `/api/expenses` | Create monthly expense |
| GET | `/api/expenses` | List expenses (supports pagination) |
| PUT | `/api/expenses/:id` | Update expense (immutability-protected) |
| DELETE | `/api/expenses/:id` | Delete expense (immutability-protected) |
| POST | `/api/catering` | Create catering order |
| GET | `/api/catering` | List catering orders (supports search, filter) |
| PATCH | `/api/catering/:id` | Update catering status (forward-only) |
| PUT | `/api/catering/:id` | Full catering update |
| DELETE | `/api/catering/:id` | Delete catering order |
| POST | `/api/ai/summary` | Generate AI business summary |
| GET | `/api/settings/gemini` | Get Gemini config status |
| POST | `/api/settings/gemini` | Save Gemini API key (encrypted) |
| DELETE | `/api/settings/gemini` | Remove stored API key |
| POST | `/api/settings/gemini/test` | Test Gemini connection |
| GET | `/health` | Health check |

---

## Deployment

**Railway** (recommended):

1. Push to GitHub
2. Create Railway project with 3 services:
   - `restopulse-api` — Node.js Web Service
   - `restopulse-web` — Static Site (Vite build output)
   - `restopulse-db` — PostgreSQL
3. Set environment variables (see `.env.example`)
4. Build command for frontend: `cd frontend && npm install && npm run build`
5. Run `npm run db:migrate:prod` on the API service for database setup

See `DEPLOYMENT.md` for detailed steps.

---

## User Guide

### Cara Login

Buka aplikasi di browser, masukkan username dan password. Jika belum memiliki akun, daftar melalui halaman register.

### Dashboard

Setelah login, dashboard menampilkan KPI cards, line chart tren omset, pie chart menu terlaris, ringkasan catering. Gunakan filter tanggal (Hari Ini / 7 Hari / 30 Hari / Semua Data / Custom). Klik **Ringkasan AI** untuk analisis otomatis oleh Gemini.

### Data Management

Buka melalui sidebar untuk: **Run Simulation** (generate data demo), **Manual Entry** (daily sales, monthly expenses, catering orders), **Reset Data** (hapus semua data).

### Catering Management

Kelola pesanan catering dengan status workflow Pending → Confirmed → Done. Cari klien, filter status, edit, hapus.

### E-Report

Generate laporan keuangan multi-section. Pilih rentang tanggal (Harian/Mingguan/Bulanan/Custom). Export PDF atau CSV.

### AI Business Summary

Klik tombol Ringkasan AI di dashboard. Jika belum ada API key, sistem menampilkan dialog untuk membuka Settings. Konfigurasi API key melalui Settings → Gemini AI.

### Gemini Settings

Buka Settings (⚙️) untuk: menambah/memperbarui/menghapus API key, memilih model Gemini, menguji koneksi. API key dienkripsi dengan AES-256-CBC sebelum disimpan. Tanpa stored key, sistem menggunakan `GEMINI_API_KEY` dari `.env`.

---

*Panduan ini ditulis untuk pemilik restoran dan pengembang. Untuk dokumentasi arsitektur teknis, lihat `implementation-plan.md`.*
