# Phase 1: Foundation — Research

**Phase:** 1 — Foundation (Database, Auth, Data Entry API, Dummy Injector)
**Researched:** 2026-06-25
**Confidence:** HIGH
**Source:** Synthesis of `.planning/research/` artifacts for Phase 1 scope

---

## Executive Summary

Phase 1 implements the backend foundation of RestoPulse using well-established, mature patterns. Research confidence is **HIGH** because all technologies (Express, Prisma, SQLite, bcryptjs, JWT, Zod) are industry-standard with extensive documentation and community support. The primary risks are not technical novelty but **schema rigidity** (decisions made now are hard to reverse) and **security posture** (financial data requires solid auth from day one).

The recommended approach is a **Layered Monolith** with Repository pattern over Prisma, Service layer with pure functions, and thin Express controllers. SQLite is chosen for zero-config deployment; Prisma provides type-safe migrations. Authentication uses stateless JWT (no session store needed for single-user app) with bcryptjs hashing.

Three schema decisions are irreversible without painful migrations and must be made now: (1) `outlet_id` FK on all financial tables for future multi-outlet support, (2) `timezone` enum on Outlet for Indonesia's three timezones, and (3) `data_source` enum (REAL|DUMMY) to prevent dummy data from polluting real records.

---

## Stack Analysis

### Core Technologies

| Technology | Version | Rationale | Phase 1 Relevance |
|------------|---------|-----------|-------------------|
| **Node.js** | 22.x LTS (Jod) | Active LTS until late 2027, maximum package compatibility | Runtime for Express server |
| **Express** | 5.2.1 | Minimal, well-documented, huge middleware ecosystem | HTTP API framework |
| **SQLite** | 3.x (via better-sqlite3) | Zero-config file-based DB, no separate server | Database for single-outlet MVP |
| **Prisma** | 7.8.0 | Type-safe generated client, migration management | Schema definition, queries, migrations |
| **bcryptjs** | 2.4.x | Pure JS password hashing, no native build headaches | Owner password hashing |
| **jsonwebtoken** | 9.0.x | Stateless JWT sessions, no session store | Authentication sessions |
| **Zod** | 3.x | Runtime validation with TypeScript inference | Request body validation |
| **dotenv** | 17.4.x | Environment variable management | JWT_SECRET, PORT, DATABASE_URL |

### Why Not Alternatives

- **PostgreSQL/MySQL** — Requires separate DB server deployment; overkill for single-outlet, single-user MVP. SQLite file is sufficient and simplifies Phase 5 deployment.
- **Next.js / NestJS** — Adds server-component or decorator complexity unnecessary for a non-SEO dashboard backend. Express is deliberately minimal.
- **Passport.js** — Adds strategy abstraction overhead; simple JWT verify middleware is sufficient for single-role auth.
- **TypeORM / Sequelize** — Prisma's migration tooling and type-safe client are superior for student teams with limited SQL experience.

---

## Architecture Patterns

### Layered Monolith (4 Tiers)

```
Presentation  — (Phase 2 — not in Phase 1)
API           — Express Controllers (route handlers, 100-150 LOC each)
Service       — Business logic (pure functions, no HTTP context)
Data Access   — Repository pattern over Prisma (abstract DB queries)
Database      — SQLite with WAL mode
```

### Repository Pattern

Every database entity has a corresponding Repository class:
- `OwnerRepository` — create, findByUsername, findById
- `DailySalesRepository` — create, findByDateRange, findByOutletAndDate, update
- `SalesTrendRepository` — upsert (pre-compute on write), findByDateRange
- `StatusLogRepository` — create (immutable audit records)
- `DailyReportRepository` — create, findByPeriod

**Why:** Abstracts Prisma queries for testability (mock repositories in unit tests) and future DB swaps (PostgreSQL in v2 requires only repository re-implementation, not service/controller changes).

### Service Layer with Pure Functions

Business rules live in Services, not Controllers:
- `AuthService` — hashPassword, comparePassword, generateToken, verifyToken
- `SalesService` — createSale (validates no future dates, positive revenue), getSalesByRange
- `DummyService` — generateHistoricalData (365 days with realistic distribution)
- `AggregationService` — recomputeTrends (clears and rebuilds SalesTrend for a date range)

**Why:** Keeps HTTP context (req/res) out of business logic. Services are testable without Express mocks.

### CQRS-lite for Dashboard Reads

`SalesTrend` table is pre-computed on every `DailySales` write:
- On create/update/delete of DailySales → trigger recomputation of affected date's trend
- Dashboard reads in Phase 2 will query `SalesTrend` directly (O(1) per date point)
- This avoids `GROUP BY` aggregation on every dashboard load

**Trade-off:** Writes become slightly slower (+1 DB write to SalesTrend). Acceptable because write frequency is low (1-2 entries per day) and read frequency is high (dashboard loaded many times).

---

## Critical Pitfalls (Phase 1 Relevant)

### P1. Timezone and Date-Boundary Errors
**Risk:** A sale entered at 23:30 WITA (Makassar) recorded as "tomorrow" if server uses WIB.
**Mitigation:** Store UTC timestamps but record outlet timezone explicitly (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`). Use timezone-aware `DATE_TRUNC` equivalent in Prisma/JS. Display dates as `25 Juni 2026`.
**Schema requirement:** `Outlet.timezone` enum field mandatory from day one.

### P2. Dummy Data Accidentally Polluting Real Data
**Risk:** One misclick on "Inject Dummy Data" wipes irreplaceable financial history.
**Mitigation:**
- `data_source` enum (`REAL`, `DUMMY`) on every transaction
- Typed confirmation required (type "HAPUS")
- Soft-replace: replace only DUMMY-flagged rows, never delete REAL records
- Visual tag in UI (Phase 2): dummy data shown with striped background or label
**Schema requirement:** `DailySales.data_source` enum mandatory from day one.

### P3. Security Theater That Frustrates the Owner
**Risk:** Complex password rules create friction without addressing real threats.
**Mitigation:**
- 8-character minimum password
- bcryptjs hashing (cost factor 12)
- Rate limiting after 5 failed attempts (per IP, 15-min window)
- Parameterized queries (Prisma handles this)
- No forced password resets
**Implementation:** Keep auth UX minimal; real security is in bcrypt + rate limiting + JWT httpOnly cookies.

### P4. Rigid Single-Outlet Schema
**Risk:** v2 multi-outlet support requires painful schema rewrite.
**Mitigation:** `outlet_id` foreign key on OwnerAccount, DailySales, SalesTrend, StatusLog, DailySalesReport from day one. v1 creates exactly one Outlet record and links everything to it. v2 adds multi-outlet logic without schema migration.
**Schema requirement:** All financial tables MUST have `outlet_id` indexed FK.

### P5. Manual Data Entry Fatigue (Foundation Impact)
**Risk:** Even though the full fatigue problem manifests in Phase 2, the dummy injector built in Phase 1 must double as an onboarding seeding tool.
**Mitigation:** Dummy injector generates realistic first-week data so the owner sees a meaningful dashboard immediately after first login (Phase 2). Design the injector to accept a `days` parameter (default 365, but can seed 7 days for onboarding).

---

## API Design Recommendations

### Authentication Endpoints
```
POST /api/auth/register
Body: { username: string (3-20 chars), password: string (min 8 chars) }
Response: { success: true, token: string }

POST /api/auth/login
Body: { username: string, password: string }
Response: { success: true, token: string }

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success: true }
```

### Sales Endpoints
```
POST /api/sales
Body: { date: "YYYY-MM-DD", revenue: number (positive), top_menu_items: string[] }
Response: { success: true, data: DailySales }

GET /api/sales?start=YYYY-MM-DD&end=YYYY-MM-DD
Response: { success: true, data: DailySales[] }
```

### Admin Endpoints
```
POST /api/admin/dummy-inject
Body: { days: number (default 365), confirm: "HAPUS" }
Response: { success: true, inserted: number }
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": { "revenue": "Must be a positive number" }
  }
}
```

---

## Performance Targets

- **API latency ≤500ms for 50 concurrent transactions:**
  - SQLite with WAL mode handles moderate concurrency well
  - Prisma connection pooling (default 5 connections for SQLite)
  - Pre-computed SalesTrend eliminates aggregation on read
  - Index on `DailySales(outlet_id, date)` for range queries

- **Bundle/page weight not applicable** (Phase 1 is backend-only)

---

## Research Flags

- **Schema validation:** After Prisma schema is defined, validate that all irreversible decisions (`outlet_id`, `timezone`, `data_source`) are present before running first migration.
- **JWT secret management:** Ensure `JWT_SECRET` is required in `.env` and application refuses to start without it.
- **Rate limiting library:** Research recommends `express-rate-limit` (5.0.x) — lightweight, well-maintained, no external store needed for single-node deployment.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages mature (Express ~110M weekly downloads, Prisma ~13.6M). Versions are current stable releases. |
| Schema Design | HIGH | 6 entities with clear relationships. Composite keys and enums are standard Prisma features. |
| Auth Implementation | HIGH | bcryptjs + JWT is textbook pattern. No edge cases for single-role, single-user auth. |
| Repository Pattern | HIGH | Prisma Client IS the repository abstraction for simple CRUD; custom repositories wrap it for testability. |
| Dummy Data Generation | MEDIUM-HIGH | Realistic distribution requires some tuning (weekly seasonality, menu diversity). Algorithm is straightforward but needs validation. |

**Overall confidence for Phase 1:** HIGH

---

*Research synthesized: 2026-06-25*
*Ready for planning: yes*
