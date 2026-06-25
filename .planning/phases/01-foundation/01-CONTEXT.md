# Phase 1: Foundation - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning
**Source:** ROADMAP.md, PROJECT.md, REQUIREMENTS.md, OPENCODE.md, STATE.md

<domain>
## Phase Boundary

Phase 1 delivers the complete backend foundation for RestoPulse: SQLite database schema with Prisma ORM, JWT-based owner authentication, manual daily sales entry API, and a dummy data injector for simulation/demo purposes. This phase produces no frontend UI — it is purely backend infrastructure and API surface.

**What this phase delivers:**
1. Database schema (OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport) with Prisma migrations
2. Repository layer abstracting all DB queries
3. Authentication API (register/login/logout) with bcryptjs + JWT
4. Daily sales entry API with validation and audit logging
5. Dummy data injector generating 365 days of realistic historical data
6. Centralized error handling, Zod validation schemas, and development seed script

**What this phase does NOT deliver:**
- Frontend dashboard or chart rendering (Phase 2)
- E-Report engine or export functionality (Phase 3)
- Performance optimization or load testing (Phase 4)
- Production deployment (Phase 5)

**Success Criteria (from ROADMAP):**
1. Pemilik dapat login dengan username/password dan diarahkan ke dasbor
2. Pemilik dapat mengisi formulir data transaksi harian baru
3. Sistem dapat menyuntikkan 365 hari data simulasi ke database dalam sekali klik
4. API merespons dengan latency ≤500ms untuk 50 transaksi bersamaan

</domain>

<decisions>
## Implementation Decisions

### Stack & Architecture
- **Runtime:** Node.js 22.x LTS with Express 5.2.1
- **Database:** SQLite (file-based) with Prisma 7.8.0 ORM
- **Auth:** bcryptjs (pure JS, no native build) + jsonwebtoken (stateless JWT)
- **Validation:** Zod for runtime request validation
- **Architecture:** Layered monolith — Repository → Service → Controller → Route

### Schema Design
- **OwnerAccount** stores username, hashed password, created_at
- **Outlet** stores outlet name, timezone (Asia/Jakarta, Asia/Makassar, Asia/Jayapura), created_at
- **DailySales** stores date, revenue, top_menu_items (JSON), outlet_id, data_source (REAL|DUMMY), created_at, updated_at
- **SalesTrend** pre-computed aggregation table (date, revenue, menu_popularity_json, outlet_id) for O(1) dashboard reads
- **StatusLog** immutable audit trail (action, entity_type, entity_id, old_value, new_value, actor_id, created_at)
- **DailySalesReport** cached report snapshots (period_start, period_end, total_revenue, transaction_count, top_items_json, generated_at)
- **Timezone handling:** Store UTC timestamps but record outlet timezone explicitly; use timezone-aware aggregations
- **data_source enum:** REAL vs DUMMY on every transaction to prevent pollution

### Authentication
- **Password policy:** Minimum 8 characters, no forced resets
- **Rate limiting:** 5 failed attempts per 15-minute window per IP
- **JWT:** Stateless, 24h expiry, stored in httpOnly cookie
- **Authorization:** All non-auth endpoints require valid JWT

### Dummy Data Injector
- **Admin-gated:** Only authenticated owner can trigger
- **Typed confirmation:** Require typing "HAPUS" before overwriting existing dummy data
- **Soft-replace:** Replace only DUMMY-flagged rows, never delete REAL data
- **Distribution:** Realistic weekly seasonality (weekends higher), monthly trends, random menu selection from preset list

### API Design
- **Base path:** `/api`
- **Auth routes:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- **Sales routes:** `POST /api/sales` (create), `GET /api/sales` (list by date range)
- **Admin routes:** `POST /api/admin/dummy-inject` (protected + owner-only check)
- **Content-Type:** JSON exclusively
- **Error format:** `{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": {} } }`

### the agent's Discretion
- Exact Prisma field types (String, Int, Decimal, DateTime, Json) — use Decimal for currency
- Repository method naming conventions (findById, findMany, create, update, delete)
- Express middleware ordering (cors → json parser → auth → routes → error handler)
- Seed script implementation details (whether to use Prisma seed feature or standalone Node script)
- Exact structure of StatusLog old_value/new_value JSON shape
- Whether to implement refresh tokens for JWT (out of scope for MVP, stick to 24h expiry)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core value, business context, constraints, key decisions
- `.planning/ROADMAP.md` — Phase goals, requirements mapping, plan outlines
- `.planning/REQUIREMENTS.md` — Requirement IDs (AUTH-01, AUTH-02, DATA-01, DATA-02) with descriptions
- `.planning/STATE.md` — Current project state, accumulated decisions, pending todos

### Technical Specifications
- `OPENCODE.md` — Stack constraints (Express, Prisma, PostgreSQL/dev.db), UI design rules (24pt font, dark mode), Git flow
- `.planning/research/SUMMARY.md` — Research synthesis: stack rationale, architecture approach, critical pitfalls
- `.planning/research/STACK.md` — Detailed package versions and alternatives analysis
- `.planning/research/ARCHITECTURE.md` — Layered monolith pattern, component boundaries, data flow
- `.planning/research/PITFALLS.md` — 10 critical pitfalls with mitigations (timezone, dummy data pollution, security theater, etc.)

### GSD Workflow References
- `@C:/Users/USER/.config/opencode/gsd-core/workflows/execute-plan.md` — Execution contract for downstream agents
- `@C:/Users/USER/.config/opencode/gsd-core/templates/phase-prompt.md` — PLAN.md format specification
- `@C:/Users/USER/.config/opencode/gsd-core/references/checkpoints.md` — Checkpoint task patterns

</canonical_refs>

<specifics>
## Specific Ideas

### Database Schema Details
- Outlet table MUST have timezone enum from day one to prevent Pitfall #4 (timezone boundary errors)
- DailySales table MUST have `data_source` enum (REAL|DUMMY) from day one to prevent Pitfall #5 (dummy data pollution)
- All financial tables MUST have `outlet_id` foreign key from day one to prevent Pitfall #10 (rigid single-outlet schema)
- DailySales.date should be unique per outlet (composite unique: [outlet_id, date])
- SalesTrend should be pre-computed on write (CQRS-lite) to guarantee O(1) dashboard reads in Phase 2

### API Latency Target
- ≤500ms for 50 concurrent transactions requires:
  - Indexed `date` column on DailySales
  - Pre-computed SalesTrend (no aggregation on read)
  - Connection pooling on SQLite (better-sqlite3 default is synchronous, but Prisma manages this)

### Security Requirements
- Parameterized queries via Prisma (SQL injection prevention)
- Input validation via Zod (XSS prevention via type safety)
- Row-level security: every endpoint verifies JWT and filters by authenticated owner's outlet
- No sensitive data in JWT payload (only user_id, outlet_id)

### Seed & Development
- Seed script creates one OwnerAccount (username: "admin", password: "admin123") for local development ONLY
- Seed script creates one Outlet with timezone Asia/Jakarta
- Development database file: `prisma/dev.db` (gitignored)

</specifics>

<deferred>
## Deferred Ideas

- **Refresh tokens** — v1 uses simple 24h JWT expiry; refresh token rotation deferred to v2
- **Multi-outlet support** — Schema has `outlet_id` FK but v1 only supports single outlet; multi-tenant logic deferred to v2
- **OAuth / SSO** — Only username/password auth for v1
- **Role-based access control** — Only "owner" role exists; staff/manager roles deferred to v2
- **Real-time POS integration** — Explicitly out of scope per PROJECT.md
- **WhatsApp notifications** — Explicitly Won't Have for v1 (FR-010)

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-06-25 via integrated planning workflow*
