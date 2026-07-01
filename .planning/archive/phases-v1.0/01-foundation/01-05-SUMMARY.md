---
phase: 01-foundation
plan: 05
subsystem: application-bootstrap
requires:
  - 01-01
  - 01-02
  - 01-03
  - 01-04
provides:
  - express-app
  - error-handling
  - rate-limiting
  - dev-seed
affects:
  - all-routes
tech-stack:
  added:
    - express-rate-limit
patterns:
  - centralized-error-handler
  - rate-limited-auth
  - middleware-composition
key-files:
  created:
    - src/middleware/errorHandler.ts
    - src/middleware/rateLimiter.ts
    - src/app.ts
    - src/server.ts
    - scripts/seed.ts
  modified:
    - package.json
    - tsconfig.json
key-decisions:
  - "Auth routes rate-limited to 5 req/15min to prevent brute-force attacks"
  - "Seed script uses prisma singleton for adapter compatibility"
  - "Health check endpoint at GET /health returns timestamp"
requirements-completed:
  - AUTH-01
  - AUTH-02
  - DATA-01
  - DATA-02
duration: "15 min"
completed: "2026-06-25T23:05:00Z"
coverage:
  - deliverable: "Centralized error handler"
    verification:
      - kind: command
        ref: "npx tsc --noEmit --skipLibCheck"
        status: pass
    human_judgment: false
  - deliverable: "Rate limiter for auth endpoints"
    verification:
      - kind: command
        ref: "npx tsc --noEmit --skipLibCheck"
        status: pass
    human_judgment: false
  - deliverable: "Express app with all routes wired"
    verification:
      - kind: command
        ref: "npx tsc --noEmit --skipLibCheck"
        status: pass
    human_judgment: false
  - deliverable: "Development seed script"
    verification:
      - kind: command
        ref: "npm run db:seed -> exits 0"
        status: pass
    human_judgment: false
  - deliverable: "Database seeded with test data"
    verification:
      - kind: command
        ref: "ts-node check-db.ts -> Outlets: 1, Owners: 1, Sales: 7"
        status: pass
    human_judgment: false
---

# Phase 1 Plan 5: Validation, Error Handling & Seed Summary

**Completed:** 2026-06-25 | **Duration:** ~15 min | **Tasks:** 3/3

## Accomplishments

1. **Created centralized error handler** (`src/middleware/errorHandler.ts`):
   - Handles ZodError → 400 with field-level details
   - Handles Prisma P2002 (unique) → 409
   - Handles Prisma P2025 (not found) → 404
   - Handles generic errors → 400 or 500
   - Logs all errors to console with method and path

2. **Created rate limiter** (`src/middleware/rateLimiter.ts`):
   - 5 requests per 15-minute window per IP
   - Returns structured JSON error with code RATE_LIMITED

3. **Created Express app** (`src/app.ts`):
   - Middleware stack: cors → json parser → urlencoded → routes → errorHandler
   - Health check at GET /health
   - Auth routes at /api/auth with rate limiter
   - Sales routes at /api/sales
   - Admin routes at /api/admin

4. **Created server entry** (`src/server.ts`):
   - Configurable port (default 3000)
   - JWT_SECRET validation warning

5. **Created seed script** (`scripts/seed.ts`):
   - Clears all data in correct FK order
   - Creates outlet "Resto Utama" (Asia/Jakarta)
   - Creates owner "admin" with bcrypt-hashed password
   - Creates 7 days of sample sales data (REAL)
   - Logs credentials for developer convenience

6. **Updated package.json** with dev, start, build, db:migrate, db:generate, db:seed scripts

## Deviations from Plan

**[Rule 3 - Technical Adaptation] Seed script uses Prisma singleton**
- Found: Creating `new PrismaClient()` without adapter fails in Prisma 7.8.0
- Fix: Import `prisma` from `../src/lib/prisma` instead of creating new instance
- Files modified: `scripts/seed.ts`
- Verification: `npm run db:seed` executes successfully, database confirmed

## Total deviations: 1 auto-fixed (technical adaptation). Impact: None.

## Next Step

Phase 1 execution complete — all 5 plans done. Ready for verification and phase closeout.
