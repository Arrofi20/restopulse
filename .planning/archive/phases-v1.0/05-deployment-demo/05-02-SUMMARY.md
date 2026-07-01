---
phase: 05-deployment-demo
plan: 02
subsystem: deployment
tags: [render, vite, cors, env-vars, split-deploy]

requires:
  - phase: 05-01
    provides: Production environment setup (Render Web Service + PostgreSQL + Prisma config)

provides:
  - Frontend API client reads VITE_API_BASE_URL at build time for split deploy
  - Render Blueprint (render.yaml) with backend Web Service, PostgreSQL DB, and frontend Static Site
  - Verified backend and frontend build outputs
  - Deployment verification guide (DEPLOYMENT.md)

affects: []

tech-stack:
  added: []
  patterns:
    - "Build-time env injection: VITE_API_BASE_URL injected into static bundle via import.meta.env"
    - "Split-deploy CORS: backend allows only exact frontend origin with credentials: true"

key-files:
  created:
    - render.yaml
    - DEPLOYMENT.md
  modified:
    - frontend/src/api/client.ts
    - frontend/vite.config.ts
    - tsconfig.json

key-decisions:
  - "Fixed tsconfig rootDir from '.' to './src' so tsc produces dist/server.js, matching the npm start script expectation"
  - "Created DEPLOYMENT.md with verification commands for post-Render-deploy validation rather than attempting live curls against non-existent services"

patterns-established:
  - "Frontend API base URL must come from VITE_* build-time env vars for split deploy compatibility"
  - "tsconfig rootDir should match the source directory that contains the server entry point"

requirements-completed:
  - DEPLOY-02

coverage:
  - id: D1
    description: "Frontend API client uses build-time VITE_API_BASE_URL with /api fallback"
    requirement: DEPLOY-02
    verification:
      - kind: other
        ref: "grep 'import.meta.env.VITE_API_BASE_URL' frontend/src/api/client.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "CORS configured for split-deploy origins with credentials: true"
    requirement: DEPLOY-02
    verification:
      - kind: other
        ref: "grep 'credentials: true' src/app.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Render Blueprint documents full infrastructure (Web Service + PostgreSQL + Static Site)"
    requirement: DEPLOY-02
    verification:
      - kind: other
        ref: "Test-Path render.yaml && grep services/databases/staticSites"
        status: pass
    human_judgment: false
  - id: D4
    description: "Backend and frontend both compile successfully"
    requirement: DEPLOY-02
    verification:
      - kind: other
        ref: "npm run build exits 0 && Test-Path dist/server.js"
        status: pass
      - kind: other
        ref: "cd frontend && npm run build exits 0 && Test-Path frontend/dist/index.html"
        status: pass
    human_judgment: false
  - id: D5
    description: "Deployment verification guide documents live URLs and curl checks"
    requirement: DEPLOY-02
    verification:
      - kind: other
        ref: "Test-Path DEPLOYMENT.md && grep restopulse-api /health RestoPulse"
        status: pass
    human_judgment: true
    rationale: "Actual HTTPS curl verification requires services to be deployed on Render first; DEPLOYMENT.md provides the procedural verification steps for post-deployment human verification"

duration: 4min
completed: 2026-06-27
status: complete
---

# Phase 05 Plan 02: Split-Deploy Render Preparation Summary

**Frontend API client reads VITE_API_BASE_URL at build time, Render Blueprint defines Web Service + PostgreSQL + Static Site, and both builds compile cleanly with corrected tsconfig output paths.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-27T17:54:46Z
- **Completed:** 2026-06-27T17:58:46Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments
- Frontend API client uses `import.meta.env.VITE_API_BASE_URL` with `/api` fallback for split-deploy compatibility
- Render Blueprint (`render.yaml`) defines backend Web Service (`restopulse-api`), PostgreSQL database (`restopulse-db`), and frontend Static Site (`restopulse-web`)
- Backend and frontend both compile successfully; `tsconfig.json` fixed so `dist/server.js` matches `npm start`
- `DEPLOYMENT.md` documents expected Render URLs, verification curl commands, and deployment steps

## Task Commits

Each task was committed atomically:

1. **Task 1: Frontend API base URL from build-time env var** - `f9398ef` (feat)
2. **Task 2: Render Blueprint (render.yaml)** - `cffe457` (feat)
3. **Task 3: Verify backend and frontend builds compile** - `8b8b5d1` (fix)
4. **Task 4: Verify live production deployment on Render** - `eb44e77` (docs)

**Plan metadata:** *(pending final docs commit)*

## Files Created/Modified
- `frontend/src/api/client.ts` — Replaced hardcoded `API_BASE = '/api'` with `import.meta.env.VITE_API_BASE_URL` fallback
- `frontend/vite.config.ts` — Added comment documenting VITE_API_BASE_URL build-time requirement
- `tsconfig.json` — Changed `rootDir` from `.` to `./src` so `tsc` emits `dist/server.js` (matches `npm start`)
- `render.yaml` — Render Blueprint with backend Web Service, PostgreSQL DB, and frontend Static Site
- `DEPLOYMENT.md` — Deployment verification guide with URLs, curl commands, and env var reference

## Decisions Made
- Fixed `tsconfig.json` `rootDir` to `./src` because the existing config produced `dist/src/server.js` while `npm start` expected `dist/server.js`. This was a pre-existing misalignment that would break production startup.
- Created `DEPLOYMENT.md` as a procedural verification guide rather than attempting live curls, because Render services have not yet been instantiated from the blueprint.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed tsconfig rootDir to produce dist/server.js**
- **Found during:** Task 3 (Verify backend and frontend builds compile)
- **Issue:** `tsc` with `rootDir: "."` produced `dist/src/server.js`, but `package.json` start script expects `dist/server.js`
- **Fix:** Changed `tsconfig.json` `rootDir` to `"./src"` and removed `scripts/**/*` from `include` (scripts run via ts-node, not tsc)
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run build` exits 0 and `Test-Path dist/server.js` returns True
- **Committed in:** `8b8b5d1` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix for production deployment correctness. `npm start` would fail without this alignment.

## Issues Encountered
- Backend `tsc` output path mismatch between `tsconfig.json` and `package.json` start script. Resolved by adjusting `rootDir`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Split-deploy frontend/backend configuration complete
- Render Blueprint ready for dashboard import
- Build outputs verified and aligned with start scripts
- Ready for actual Render deployment (manual step via Render dashboard)

## Self-Check: PASSED

- [x] `render.yaml` exists at project root
- [x] `DEPLOYMENT.md` exists at project root
- [x] `05-02-SUMMARY.md` exists in plan directory
- [x] Commit `f9398ef` (Task 1) found in git history
- [x] Commit `cffe457` (Task 2) found in git history
- [x] Commit `8b8b5d1` (Task 3) found in git history
- [x] Commit `eb44e77` (Task 4) found in git history

---
*Phase: 05-deployment-demo*
*Completed: 2026-06-27*
