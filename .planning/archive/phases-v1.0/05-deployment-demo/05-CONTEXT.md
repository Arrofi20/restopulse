# Phase 5: Deployment & Demo - Context

**Gathered:** 2026-06-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 delivers production deployment, demo readiness, and onboarding documentation for RestoPulse. This includes deploying the backend API and frontend dashboard to a live production environment, ensuring the demo data injector works for presentations, and producing a user-facing onboarding guide in Bahasa Indonesia.

**What this phase delivers:**
1. Production deployment of backend API (Node.js + Express + Prisma + PostgreSQL)
2. Production deployment of frontend dashboard (React + Vite static build)
3. Environment-based database configuration (SQLite dev → PostgreSQL prod)
4. Demo data readiness via the existing "Suntik Data Simulasi" feature
5. User onboarding guide (README) in Bahasa Indonesia for restaurant owners

**What this phase does NOT deliver:**
- Multi-environment CI/CD pipelines or automated deployments
- Docker containerization
- External uptime monitoring or alerting services
- Structured error logging or log aggregation
- WhatsApp notifications or scheduled reports (v2, deferred)
- Multi-outlet or multi-tenant deployment architecture

**Success Criteria (from ROADMAP):**
1. Sistem berhasil di-deploy ke production environment
2. Sistem beroperasi 1 hari penuh tanpa insiden kritis
3. Dokumentasi onboarding tersedia untuk pemilik restoran
4. Demo data simulasi siap untuk presentasi

</domain>

<decisions>
## Implementation Decisions

### Hosting & Platform
- **D-57:** Hosting platform: **Render.com** — chosen for free-tier Web Service + PostgreSQL + Static Site, suitable for academic MVP demo.
- **D-58:** Backend deployed as **Render Web Service** with **Render PostgreSQL** database (not SQLite). PostgreSQL provides persistent storage with ephemeral-safe filesystem.
- **D-59:** Frontend deployed as **Render Static Site** (separate service from backend). Split deploy allows independent frontend hosting on Render's static site offering.
- **D-60:** Database strategy: **SQLite for local development** (`prisma/dev.db`), **PostgreSQL for production** (Render). Environment-based Prisma datasource configuration required.
- **D-61:** Deployment architecture: **Split deploy** — backend API on one Render service, frontend static build on another. Frontend talks to backend via public API URL (not Vite dev proxy).

### Demo & Onboarding
- **D-62:** Demo data: **Use existing "Suntik Data Simulasi" button** on the dashboard. No pre-seeded demo account or special demo mode needed. The existing dummy injector (DATA-01) is sufficient for live demo presentations.
- **D-63:** Onboarding format: **Short user guide inside README**, written in **Bahasa Indonesia**, targeting restaurant owners (not developers).
- **D-64:** README scope: **User guide** covering login, dashboard navigation, E-Report export (PDF/CSV), and demo data injection. Not API documentation. Auto-generated from existing codebase where possible.

### Monitoring & Operations
- **D-65:** Monitoring scope: **Existing `/health` endpoint only** (`GET /health` returns `{status: 'ok', timestamp}`). No additional external uptime monitoring (e.g., UptimeRobot) or structured logging (e.g., Winston) for this phase.
- **D-66:** SSL: Handled automatically by Render (HTTPS on `*.onrender.com` and custom domains). No manual certificate management.

### the agent's Discretion
- Exact Render service configuration (instance region, plan tier, env var naming conventions)
- Prisma production setup: `prisma migrate deploy` vs `prisma db push` for production schema initialization
- Frontend build output directory and Render Static Site publish settings
- Seed script adaptation if PostgreSQL syntax differs from SQLite for initial data
- README structure, depth, and formatting (Markdown sections, screenshots optional)
- CORS origin configuration for production (update `CORS_ORIGIN` env var)
- JWT_SECRET and other sensitive env var generation and injection

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core value, business context, constraints (8-week timeline, single-outlet, budget-conscious)
- `.planning/ROADMAP.md` — Phase 5 goals, 4 plans, success criteria
- `.planning/REQUIREMENTS.md` — Requirement traceability (all v1 requirements already mapped to Phases 1–4)
- `.planning/STATE.md` — Current project state, accumulated decisions from Phases 1–4

### Phase 1–4 Context (Prior Decisions)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Schema design, auth flow, JWT strategy, CQRS-lite
- `.planning/phases/02-dashboard/02-CONTEXT.md` — UI decisions, component patterns, data fetching
- `.planning/phases/03-e-report-engine/03-CONTEXT.md` — Report API, PDF/CSV export engines
- `.planning/phases/04-quality-assurance/04-CONTEXT.md` — Testing patterns, security guards, performance NFRs

### Technical Specifications
- `OPENCODE.md` — Stack constraints, UI design rules (dark mode, 24pt font), NFRs (≤4s page load, ≤800KB)
- `prisma/schema.prisma` — Database schema (OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport)
- `prisma.config.ts` — Prisma configuration with SQLite datasource URL
- `src/app.ts` — Express app setup, route mounting, health endpoint (`/health`)
- `src/server.ts` — Server entry point, PORT and JWT_SECRET validation
- `frontend/vite.config.ts` — Vite dev server proxy (`/api` → `localhost:3000`), build config
- `frontend/package.json` — Build script (`tsc -b && vite build`)
- `package.json` (root) — Backend dependencies, scripts (`build`, `start`, `db:migrate`)

### Deployment-Relevant Code
- `src/middleware/authMiddleware.ts` — JWT Bearer auth (env-dependent secret)
- `src/middleware/errorHandler.ts` — Centralized error handler (must not leak stack traces in production)
- `src/middleware/rateLimiter.ts` — Auth rate limiter (5 req/15min)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`/health` endpoint** (`src/app.ts`): Already returns `{status: 'ok', timestamp}` — satisfies monitoring success criterion without additional work.
- **Dummy data injector** (`src/routes/admin.routes.ts` + `AdminController/Service`): Existing `POST /api/admin/dummy-inject` endpoint injects 365 days of simulated data — ready for demo use.
- **Frontend build pipeline** (`frontend/package.json`): `npm run build` produces optimized static assets via Vite.
- **Prisma schema** (`prisma/schema.prisma`): Uses `provider = "sqlite"` hardcoded — needs environment-based datasource for PostgreSQL production.
- **`prisma.config.ts`**: Hardcodes `file:./prisma/dev.db` — needs env-based override for production.

### Established Patterns
- **Environment variables**: `JWT_SECRET`, `CORS_ORIGIN`, `PORT` already read from `process.env`. Extend this pattern for `DATABASE_URL`.
- **Layered monolith**: Repository → Service → Controller → Route — backend deploys as a single Express app.
- **JWT Bearer auth**: `restopulse_token` in localStorage + `Authorization: Bearer` header — works across origins with proper CORS.
- **Dark mode UI**: Tailwind `dark` class, amber accents — static build preserves them.
- **Error format**: `{ success: false, error: { code, message } }` — no stack traces in production responses (verified in Phase 4 security audit).

### Integration Points
- **CORS update**: `src/app.ts` currently uses `process.env.CORS_ORIGIN || 'http://localhost:5173'`. For production, set `CORS_ORIGIN` to the deployed frontend Static Site URL.
- **API base URL**: Frontend `api/client.ts` uses relative `/api` paths. For split deploy, may need `VITE_API_BASE_URL` env var pointing to backend Render URL.
- **Database migration**: Production PostgreSQL requires `prisma migrate deploy` (not `prisma migrate dev`) in the Render build/start command.
- **Static site routing**: Frontend uses React Router (`BrowserRouter`). Static site host must support SPA fallback (redirect 404s to `index.html`).

### Deployment Gotchas
- **SQLite → PostgreSQL schema differences**: Prisma handles most, but verify `json` field handling (currently stored as `String` for SQLite). PostgreSQL has native `Json` type — test compatibility.
- **File uploads**: None in v1 — no filesystem persistence concerns beyond the database.
- **Session state**: JWT is stateless — no Redis/session store needed. Multiple Render instances (if scaled) work without sticky sessions.

</code_context>

<specifics>
## Specific Ideas

- Render Web Service free tier: sleeps after 15 min inactivity (cold starts acceptable for academic demo)
- Render PostgreSQL free tier: 1 GB storage, sufficient for single-outlet MVP data
- Frontend static build should set `VITE_API_BASE_URL` at build time (or runtime via `window.__ENV__` if needed)
- README user guide sections: (1) Cara Login, (2) Melihat Dasbor, (3) Mengekspor Laporan (PDF/CSV), (4) Menyuntik Data Demo
- No screenshots required in README unless easily obtainable — text-based instructions are acceptable for MVP

</specifics>

<deferred>
## Deferred Ideas

- **Docker containerization** — nice-to-have for portability, but Render Web Service supports native Node.js builds without Docker
- **CI/CD pipeline (GitHub Actions)** — out of scope for 8-week academic MVP; manual deploy via Render dashboard or Git integration is sufficient
- **Custom domain + SSL** — `*.onrender.com` is sufficient for demo; custom domain belongs to v2 if productized
- **External uptime monitoring (UptimeRobot, Pingdom)** — success criterion #2 (1 day without critical incidents) can be verified manually during demo day
- **Structured logging (Winston, Pino)** — overkill for single-outlet academic MVP

</deferred>

---

*Phase: 05-deployment-demo*
*Context gathered: 2026-06-27*
