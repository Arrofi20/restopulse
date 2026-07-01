# Phase 5: Deployment & Demo - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 05-deployment-demo
**Areas discussed:** Hosting strategy, Deployment architecture, Demo data & onboarding format, Monitoring & alerting scope

---

## Hosting Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| VPS (DigitalOcean, AWS EC2) | Self-managed server, manual SSL, persistent disk | |
| PaaS (Render, Railway, Vercel) | Managed platform, automatic SSL, but SQLite file may be ephemeral on some PaaS | |
| **Render.com** | Free-tier Web Service + PostgreSQL + Static Site, suitable for academic MVP demo | ✓ |

**User's choice:** Deploy ke Render.com. Backend sebagai Web Service dengan database PostgreSQL dari Render (bukan SQLite). Frontend sebagai Static Site terpisah.
**Notes:** User explicitly chose Render.com. Split deploy (backend Web Service + frontend Static Site). PostgreSQL on Render replaces SQLite for production persistence.

---

## Deployment Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Single server (Express serves static files) | Backend serves built frontend, one domain, no CORS | |
| **Split deploy** (backend API + frontend static host) | Frontend on Render Static Site, backend on Render Web Service, CORS needed | ✓ |
| Frontend on Vercel/Netlify | Static host with edge CDN, backend elsewhere | |

**User's choice:** Frontend sebagai Static Site terpisah.
**Notes:** Current dev setup uses Vite proxy (`/api` → `localhost:3000`). Split deploy requires updating frontend API base URL to backend's public Render URL and setting `CORS_ORIGIN` on backend.

---

## Database Dev vs Prod

| Option | Description | Selected |
|--------|-------------|----------|
| **SQLite lokal, PostgreSQL di Render** | Environment-based Prisma datasource config; dev stays simple | ✓ |
| PostgreSQL semua | Uniform stack but requires local PostgreSQL setup | |

**User's choice:** Tetap SQLite lokal, PostgreSQL di Render — standar saja, konfigurasi environment-based Prisma datasource.
**Notes:** Prisma schema currently hardcodes `provider = "sqlite"` and `prisma.config.ts` hardcodes `file:./prisma/dev.db`. Both need environment-based overrides.

---

## Demo Data & Onboarding Format

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-seeded demo account | Demo user with 365 days of data already in DB | |
| **Existing "Suntik Data Simulasi" button** | Live demo uses the dashboard's dummy injector (DATA-01) | ✓ |

**User's choice:** Demo menggunakan tombol Suntik Data Simulasi yang sudah ada di dashboard.
**Notes:** No special demo mode or pre-seeding needed. The existing Phase 1 dummy injector is sufficient.

| Option | Description | Selected |
|--------|-------------|----------|
| Printable PDF manual | Formal user guide document, potentially with screenshots | |
| **Short guide in README** | Concise Markdown instructions inside the project README | ✓ |

**User's choice:** Onboarding sebagai panduan singkat dalam README bahasa Indonesia.
**Notes:** README should be user-facing (restaurant owner), not API documentation. Covers login, dashboard, export, and demo injection. Written in Bahasa Indonesia.

---

## Monitoring & Alerting Scope

| Option | Description | Selected |
|--------|-------------|----------|
| **Existing `/health` only** | Current health endpoint is sufficient for MVP | ✓ |
| Add external monitoring (UptimeRobot) | Free-tier uptime checks and alerts | |
| Add structured logging (Winston/Pino) | Application-level log aggregation | |

**User's choice:** Monitoring cukup endpoint /health yang sudah ada.
**Notes:** Success criterion #2 (operate 1 day without critical incidents) will be verified manually during demo day.

---

## the agent's Discretion

User did not explicitly delegate to agent discretion, but several implementation details were not specified and fall under agent discretion per the workflow:
- Exact Render service configuration (region, plan tier, env var naming)
- Prisma production migration strategy (`migrate deploy` vs `db push`)
- Frontend build output directory and Render publish settings
- Seed script adaptation for PostgreSQL
- README exact structure and formatting
- CORS origin env var configuration for production
- JWT_SECRET generation and injection

## Deferred Ideas

- Docker containerization — noted but not needed for Render native builds
- CI/CD pipeline (GitHub Actions) — out of scope for 8-week academic MVP
- Custom domain + SSL — `*.onrender.com` is sufficient for demo
- External uptime monitoring (UptimeRobot, Pingdom) — deferred to v2 if productized
- Structured logging (Winston, Pino) — overkill for single-outlet academic MVP
