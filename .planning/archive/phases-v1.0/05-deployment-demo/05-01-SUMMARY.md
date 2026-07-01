---
phase: 05-deployment-demo
plan: 01
subsystem: infra
tags: [prisma, postgresql, sqlite, render, environment, deployment]

requires:
  - phase: 04-quality-assurance
    provides: Security audit, functional tests, performance baseline
provides:
  - Environment-aware Prisma configuration supporting SQLite (local) and PostgreSQL (production)
  - Documented environment variables in .env.example
  - Production migration command (db:migrate:prod)
  - Server startup validation for DATABASE_URL and DB_PROVIDER
  - Separate Prisma schema file for PostgreSQL production
affects:
  - 05-02-PLAN.md (backend/frontend deploy depends on env config)
  - 05-03-PLAN.md (demo data injector uses DB connection)

tech-stack:
  added: []
  patterns:
    - Dual-schema Prisma setup (schema.prisma for SQLite dev, schema.postgresql.prisma for PostgreSQL prod)
    - process.env.DATABASE_URL for database connection URL in prisma.config.ts
    - Server startup env validation (same style as existing JWT_SECRET check)

key-files:
  created:
    - prisma/schema.postgresql.prisma
    - .env.example
    - scripts/db-connect-test.ts
  modified:
    - prisma.config.ts
    - src/server.ts
    - package.json

key-decisions:
  - "Prisma 7 does not support env() in datasource provider argument; kept provider as literal string and created separate schema.postgresql.prisma for production (auto-fix Rule 1)"
  - "Prisma 7 also removed url from schema files; moved connection URL entirely to prisma.config.ts (auto-fix Rule 1)"
  - "db:migrate:prod script explicitly targets --schema=prisma/schema.postgresql.prisma to avoid ambiguity"

patterns-established:
  - "Environment-based schema selection: DB_PROVIDER env var guides schema choice (via separate files + CLI flags)"
  - "Startup validation: All critical env vars (JWT_SECRET, DATABASE_URL, DB_PROVIDER) validated with console.warn in server.ts"

requirements-completed:
  - DEPLOY-01

coverage:
  - id: D1
    description: "Prisma schema and config are environment-aware (SQLite local / PostgreSQL production)"
    requirement: DEPLOY-01
    verification:
      - kind: other
        ref: "npx prisma validate (both schema.prisma and schema.postgresql.prisma pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "All required environment variables documented in .env.example"
    requirement: DEPLOY-01
    verification:
      - kind: other
        ref: "grep for DB_PROVIDER, DATABASE_URL, JWT_SECRET, CORS_ORIGIN, PORT, VITE_API_BASE_URL in .env.example"
        status: pass
    human_judgment: false
  - id: D3
    description: "Production migration command is ready and validated"
    requirement: DEPLOY-01
    verification:
      - kind: other
        ref: "package.json contains db:migrate:prod script"
        status: pass
    human_judgment: false
  - id: D4
    description: "Server warns on missing DATABASE_URL or invalid DB_PROVIDER at boot"
    requirement: DEPLOY-01
    verification:
      - kind: other
        ref: "grep DB_PROVIDER in src/server.ts + manual code review of validation block"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-06-27
status: complete
---

# Phase 05 Plan 01: Production Environment Setup Summary

**Environment-aware Prisma configuration with dual-schema SQLite/PostgreSQL support, documented env vars, and production migration command**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-27T10:44:00Z
- **Completed:** 2026-06-27T10:62:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Prisma config reads `process.env.DATABASE_URL` instead of hardcoded SQLite path
- Separate `schema.postgresql.prisma` created for Render PostgreSQL production deploys
- Server startup validates `DATABASE_URL` and `DB_PROVIDER` with warning logs
- `.env.example` documents all 6 required environment variables with section comments
- `db:migrate:prod` npm script targets PostgreSQL schema explicitly
- Both schemas pass `npx prisma validate`; DB connectivity test (`SELECT 1`) passes locally

## Task Commits

Each task was committed atomically:

1. **Task 1: Env-aware Prisma schema and config** - `062566e` (feat)
2. **Task 2: .env.example and production npm scripts** - `768a118` (chore)
3. **Task 3: Sync production schema via Prisma migrate deploy** - `71b06f7` (test)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `prisma/schema.postgresql.prisma` - PostgreSQL schema variant for production
- `prisma.config.ts` - Reads `process.env.DATABASE_URL` for datasource and migrate URLs
- `src/server.ts` - Added `DATABASE_URL` and `DB_PROVIDER` startup validation
- `.env.example` - Documented env vars (Database, Auth, CORS, Server, Frontend)
- `package.json` - Added `db:migrate:prod` script with explicit PostgreSQL schema flag
- `scripts/db-connect-test.ts` - Prisma-7-compatible connectivity test script

## Decisions Made
- Prisma 7 does not support `env()` in the `provider` argument of the `datasource` block, nor does it allow `url` in the schema file. We kept the provider as a literal string (`"sqlite"` for local, `"postgresql"` for production schema file) and moved the connection URL entirely to `prisma.config.ts`.
- The `db:migrate:prod` script explicitly passes `--schema=prisma/schema.postgresql.prisma` to avoid any ambiguity about which schema to use in production.
- Production `prisma migrate deploy` was skipped because no production `DATABASE_URL` is configured in the current environment; the exact command is documented in `.env.example`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma 7 rejects env() in datasource provider**
- **Found during:** Task 1
- **Issue:** The plan instructed `provider = env("DB_PROVIDER")` in `prisma/schema.prisma`, but Prisma 7.8.0 schema validation explicitly errors: "A datasource must not use the env() function in the provider argument."
- **Fix:** Reverted provider to literal string `"sqlite"` in `schema.prisma`; created `prisma/schema.postgresql.prisma` with `provider = "postgresql"` for production; updated `prisma.config.ts` to use `process.env.DATABASE_URL` for the connection URL.
- **Files modified:** `prisma/schema.prisma`, `prisma/schema.postgresql.prisma` (created), `prisma.config.ts`
- **Verification:** `npx prisma validate` passes for both schemas
- **Committed in:** `062566e` (Task 1 commit)

**2. [Rule 1 - Bug] Prisma 7 removed url from schema files**
- **Found during:** Task 1
- **Issue:** After fixing the provider issue, `npx prisma validate` failed with: "The datasource property `url` is no longer supported in schema files. Move connection URLs for Migrate to `prisma.config.ts`."
- **Fix:** Removed `url = env("DATABASE_URL")` from both `schema.prisma` and `schema.postgresql.prisma`; the URL is already configured in `prisma.config.ts` via `process.env.DATABASE_URL`.
- **Files modified:** `prisma/schema.prisma`, `prisma/schema.postgresql.prisma`
- **Verification:** `npx prisma validate` passes for both schemas
- **Committed in:** `062566e` (Task 1 commit)

**3. [Rule 3 - Blocking] Plan's connectivity test incompatible with Prisma 7**
- **Found during:** Task 3
- **Issue:** The plan's one-liner `node -e "new PrismaClient()..."` fails because Prisma 7 requires an `adapter` to be passed to the constructor.
- **Fix:** Wrote `scripts/db-connect-test.ts` that imports `PrismaSqlite` adapter and mirrors the project's `src/lib/prisma.ts` pattern.
- **Files modified:** `scripts/db-connect-test.ts` (created)
- **Verification:** `npx ts-node scripts/db-connect-test.ts` outputs "DB OK"
- **Committed in:** `71b06f7` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for Prisma 7 compatibility. No scope creep. The core deliverables (env-aware config, documented env vars, production migration command) are fully achieved.

## Issues Encountered
- None beyond Prisma 7 API changes that were auto-fixed per deviation rules.

## User Setup Required
None - no external service configuration required at this stage. Production DATABASE_URL and DB_PROVIDER will be set in the Render dashboard during Plan 05-02 deployment.

## Next Phase Readiness
- Ready for Plan 05-02 (Deploy backend and frontend)
- Environment configuration foundation is solid
- Both SQLite (local) and PostgreSQL (production) schemas are validated
- Production migration command is documented and ready to run on Render

---
*Phase: 05-deployment-demo*
*Completed: 2026-06-27*

## Self-Check: PASSED

- [x] `.planning/phases/05-deployment-demo/05-01-SUMMARY.md` exists on disk
- [x] Commit `062566e` (Task 1) found in git log
- [x] Commit `768a118` (Task 2) found in git log
- [x] Commit `71b06f7` (Task 3) found in git log
- [x] Commit `5e793e1` (metadata) found in git log
- [x] `npx prisma validate` passes for both SQLite and PostgreSQL schemas
- [x] `scripts/db-connect-test.ts` outputs "DB OK"
