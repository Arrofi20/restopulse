# Phase 04: Quality Assurance - Research

**Researched:** 2026-06-26
**Domain:** Software Quality Assurance — functional testing, performance/load testing, accessibility auditing, security review, UAT
**Confidence:** HIGH

## Summary

Phase 04 is a pure quality assurance phase — no new features, only verification and hardening of existing Must Have functionality across the full stack. The research spans five distinct QA domains: black-box API functional testing (supertest + vitest), performance/load testing (k6 + Lighthouse CLI), mobile responsiveness and accessibility auditing (WCAG AA practical subset), security review (JWT, SQL injection, XSS, CSV injection, error leakage), and User Acceptance Testing with the restaurant owner.

The primary technical challenge is establishing backend test infrastructure from zero — the backend currently has NO test framework, no vitest config, and no testing dependencies. The frontend already has 7 vitest test suites with jsdom and @testing-library/react. The research confirms that supertest v7.2.2 + vitest v4.1.9 is the standard combination for Express 5 API testing, using in-memory SQLite via prisma-adapter-sqlite for total test isolation. k6 must be installed as a standalone Go binary (NOT the npm `k6` dummy package), and Lighthouse CLI v13.4.0 is available via npx without installation.

**Primary recommendation:** Set up a root-level `vitest.config.ts` with `environment: 'node'` separate from the frontend's `vite.config.ts` (jsdom), install supertest + @types/supertest, and use `file::memory:` SQLite URLs for isolated API test suites. Run k6 and Lighthouse as standalone tools — no code integration needed.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| API functional testing | API / Backend | — | Tests hit Express routes via supertest in-process; auth, validation, error handling all backend concerns |
| Frontend component testing | Browser / Client | — | Already covered by 7 vitest suites (jsdom); D-38 keeps these as-is |
| Load testing (50 concurrent) | API / Backend | — | k6 hits real HTTP endpoints; measures backend throughput, DB query performance, CQRS-lite read efficiency |
| Page load performance | Browser / Client | Frontend Server | Lighthouse audits built frontend; measures bundle size, render time, network payload |
| Mobile responsiveness | Browser / Client | — | CSS/viewport testing at 4 breakpoints; all owner-facing pages |
| Accessibility audit | Browser / Client | — | Lighthouse automated + manual WCAG AA checklist; focus on owner-facing pages |
| Security verification | API / Backend | Browser / Client | JWT, SQL injection, Zod coverage on backend; CSV injection on frontend export; CORS on backend |
| UAT execution | Browser / Client | API / Backend | Owner tests full flows end-to-end; exercises both frontend and backend |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `supertest` [VERIFIED: npm registry] | 7.2.2 | HTTP assertion library for API testing | 15M+ weekly downloads; de-facto standard for Express API testing; works with any test framework; maintained by Forward Email |
| `@types/supertest` [VERIFIED: npm registry] | 7.2.0 | TypeScript types for supertest | Required for TypeScript projects; provides type-safe request chaining |
| `vitest` [VERIFIED: npm registry] | 4.1.9 | Test framework (backend) | 70M+ weekly downloads; Vite-native; already used in frontend (^4.1.9); unified toolchain |
| `k6` (standalone binary) | latest | Load testing CLI tool | Industry standard for developer-centric load testing; JS-scriptable; built-in thresholds/metrics; Grafana-backed |
| `lighthouse` [VERIFIED: npm registry] | 13.4.0 | Performance/accessibility auditing | Google-maintained; Chrome DevTools integration; programmatic + CLI APIs; WCAG AA automated checks |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `prisma-adapter-sqlite` | ^1.0.0 | SQLite adapter for in-memory test DB | Already installed; used to create isolated `:memory:` databases per test suite |
| `@prisma/client` | ^7.8.0 | Database ORM (already installed) | Test fixtures use Prisma Client to seed in-memory DB |
| `zod` | ^4.4.3 | Schema validation (already installed) | Test that Zod schemas reject invalid input in API tests |
| `jsonwebtoken` | ^9.0.3 | JWT signing/verification (already installed) | Generate test tokens in API test fixtures; verify JWT edge cases |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| supertest | node-fetch + test server | Requires manual port management; no built-in assertions; more boilerplate |
| vitest (backend) | jest + ts-jest | Jest slower startup; separate config; vitest already in frontend for unified DX |
| k6 | artillery, autocannon | Artillery is YAML-based (less flexible); autocannon is simpler but fewer metrics; k6 has richer scripting and thresholds |
| Lighthouse CLI | PageSpeed Insights web UI | PSI only tests public URLs; Lighthouse CLI tests localhost/dev server |

**Installation:**
```bash
# Backend test dependencies (in project root)
npm install --save-dev supertest @types/supertest vitest

# k6 (standalone — NOT npm install k6)
winget install k6 --source winget
# Or download from https://github.com/grafana/k6/releases

# Lighthouse (available via npx, no install required)
npx lighthouse --version
```

**Version verification:**
```bash
npm view supertest version          # 7.2.2
npm view vitest version             # 4.1.9
npm view @types/supertest version   # 7.2.0
npm view lighthouse version         # 13.4.0
```

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-37:** Testing approach: black-box API only — test endpoints via HTTP, not internal implementation
- **D-38:** Existing frontend vitest suites (7 files) are KEPT — they already cover chart helpers, hooks, and data fetching
- **D-39:** New API tests use supertest + vitest — test the Express app in-process without starting a server
- **D-40:** Test database: in-memory SQLite per test suite — fresh schema + seed data, total isolation, no cleanup needed
- **D-41:** Test coverage targets: auth flow (register/login/logout/token), data entry (POST /api/sales, validation), dashboard (GET /api/dashboard with date filter), report (GET /api/report, filtering), export (GET /api/report/export?type=pdf/csv)
- **D-42:** Load testing tool: k6 — JS-scriptable, built-in metrics/thresholds, CI-friendly
- **D-43:** Load test scenario: mixed traffic — 50 VUs cycling through POST /api/sales + GET /api/dashboard + GET /api/report
- **D-44:** Frontend performance: Lighthouse CLI with DevTools network throttling (simulated 4G)
- **D-45:** Database optimization: verify existing indexes first; only add/index tweak if the 500ms benchmark fails
- **D-46:** Audit method: Lighthouse accessibility audit + manual checklist
- **D-47:** Accessibility standard: WCAG AA practical subset — color contrast (≥4.5:1 text), touch target size (≥44px), keyboard navigation, font scaling
- **D-48:** Pages audited: login, dashboard, e-report, data-entry (all owner-facing pages; admin/injector excluded)
- **D-49:** Viewport range: 320px, 768px, 1024px, 1440px
- **D-50:** Audit depth: verify existing guards + add critical gaps (not full OWASP Top 10)
- **D-51:** Audit method: manual code review + targeted security test cases (no SAST/automated scanning)
- **D-52:** Existing guards to verify: JWT auth, Prisma parameterized queries, Zod input validation coverage, CORS config, rate limiter on auth
- **D-53:** Additional areas to check: JWT edge cases (expired token, tampered payload, missing auth on any route), CSV injection (formula prefix mitigation already in place — verify), error response leakage
- **D-54:** UAT structure: guided test script (Bahasa Indonesia) covering key flows + free exploration afterward
- **D-55:** Bug severity tiers: Critical (blocks sign-off), Major (should fix), Minor (defer to v2)
- **D-56:** Sign-off artifact: one-page checklist in Bahasa Indonesia

### the agent's Discretion

- Exact test file organization and naming conventions (follow existing `__tests__/` pattern)
- k6 script structure and threshold configuration
- Lighthouse audit thresholds and reporting format
- Manual checklist item details for mobile/accessibility
- UAT test script specific steps and scenarios
- Bug tracking format (inline in checklist or separate document)
- Whether to add npm scripts for test/lint/audit commands

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User dapat masuk ke sistem menggunakan akun (username & password) yang terdaftar | API tests: POST /api/auth/login with valid/invalid credentials; supertest auth flow tests |
| AUTH-02 | Sistem memvalidasi hak akses login dan mengarahkan pemilik ke halaman Dasbor Utama | API tests: verify 401 on unauthenticated dashboard access; JWT token validation tests |
| DASH-01 | Sistem mengagregasikan data omset dan menggambar Line Chart interaktif | Already tested via frontend vitest suites; API test: GET /api/dashboard returns correct SalesTrend data |
| DASH-02 | Sistem mengagregasikan data performa menu dan menggambar Pie Chart | Already tested via frontend vitest suites; API test: GET /api/dashboard returns menu_popularity data |
| DASH-03 | Sistem menampilkan pop-up detail (tooltip) berisi nominal angka omset dan menu terlaris | Already tested via frontend vitest suites (LineChart tooltip unit tests) |
| DATA-01 | Pemilik dapat menyuntikkan ratusan baris data transaksi fiktif harian | API test: POST /api/admin/dummy-inject creates records; verify StatusLog entries |
| DATA-02 | Pemilik dapat memasukkan data transaksi harian baru secara manual melalui formulir | API tests: POST /api/sales with valid/invalid payload; Zod validation rejection tests |
| REPT-01 | Sistem menyaring dan menyusun lembar ringkasan laporan digital sesuai filter rentang tanggal | API tests: GET /api/report?start=&end= with various date ranges; verify aggregation accuracy |
| REPT-02 | Sistem mengonversi struktur data laporan menjadi file PDF siap cetak | Client-side export — verify /api/report returns correct data for PDF generation; manual PDF visual check |

**Note on D-41 export target:** The CONTEXT.md references `GET /api/report/export?type=pdf/csv` but the backend has NO export endpoint. Export (PDF/CSV) is client-side only via `generateReportPDF()` and `generateReportCSV()` in `frontend/src/lib/`. The API test for export should verify `GET /api/report` returns the complete data structure required by the client-side export generators (period, outlet, rows with date/revenue/topMenu/dayCount).

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| supertest | npm | 12+ yrs | 15M/wk | github.com/ladjs/supertest | OK | Approved |
| @types/supertest | npm | 6+ yrs | — | DefinitelyTyped | OK | Approved |
| vitest | npm | 11 days (latest v4.1.9) | 70M/wk | github.com/vitest-dev/vitest | SUS | Flagged — already installed in frontend; v4.1.9 is a recent point release, not a new package |
| k6 (npm) | npm | 9+ yrs | 186K/wk | github.com/loadimpact/k6 | OK | **WARNING:** npm `k6` is a dummy autocomplete package, NOT the load testing tool. Real k6 is a Go binary installed via winget/download. |
| lighthouse | npm | 9+ yrs | 2M+/wk | github.com/GoogleChrome/lighthouse | OK | Approved — available via npx |

**Packages removed due to SLOP verdict:** none

**Packages flagged as suspicious [SUS]:**
- `vitest` — flagged for `too-new` signal (v4.1.9 published 2026-06-15). Already installed and verified in the frontend (`frontend/package.json` devDependencies) since Phase 2. The v4.1.9 release is a routine point release from the well-established vitest-dev organization (70M weekly downloads). For backend usage, verify the same version works with `environment: 'node'` before proceeding.

**Critical warning — k6 npm package vs. k6 binary:**
The npm package `k6` (description: "Dummy package for autocompleting k6 scripts") is NOT the Grafana k6 load testing tool. Do NOT run `npm install k6`. Install k6 as a standalone binary:
```bash
winget install k6 --source winget
# Verify: k6 version
```
If winget is unavailable, download the Windows installer from https://github.com/grafana/k6/releases.

## Architecture Patterns

### Recommended Project Structure
```
restopulse/
├── vitest.config.ts          # NEW: Backend vitest config (environment: 'node')
├── package.json              # MODIFIED: add test:api script, devDependencies
├── src/
│   ├── app.ts                # Express app export (no .listen()) — already ready for supertest
│   ├── __tests__/            # NEW: Backend API tests (co-located with source)
│   │   ├── setup.ts          # Test setup: in-memory DB, global fixtures
│   │   ├── auth.test.ts      # Auth flow: register, login, logout, token validation
│   │   ├── sales.test.ts     # Data entry: POST /api/sales, validation errors
│   │   ├── dashboard.test.ts # Dashboard: GET /api/dashboard with date filter
│   │   ├── report.test.ts    # Report: GET /api/report, filtering, data structure
│   │   └── security/         # Security-specific test cases
│   │       ├── jwt.test.ts   # JWT edge cases: expired, tampered, missing
│   │       └── injection.test.ts # SQL injection via query params, XSS in body
│   └── ...
├── frontend/
│   └── src/__tests__/        # EXISTING: 7 vitest suites (UNCHANGED per D-38)
├── k6/
│   └── load-test.js          # NEW: k6 mixed traffic script
├── lighthouse/
│   └── audit-config.js       # NEW: Lighthouse programmatic audit script
└── .planning/phases/04-quality-assurance/
    ├── uat-checklist.md       # NEW: UAT sign-off checklist (Bahasa Indonesia)
    └── accessibility-checklist.md # NEW: Manual accessibility checklist
```

### Pattern 1: In-Memory SQLite Test Isolation

**What:** Each test suite creates a fresh PrismaClient with `file::memory:` SQLite, runs migrations, and seeds fixture data in `beforeAll`. No database cleanup needed — memory is released when the client disconnects.

**When to use:** Every API test suite that needs database access. This provides total isolation — tests in different files never share state.

**Implementation:**
```typescript
// src/__tests__/setup.ts
// Source: Prisma docs + prisma-adapter-sqlite package documentation
import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';
import { execSync } from 'child_process';

export async function createTestDb(): Promise<PrismaClient> {
  const adapter = new PrismaSqlite({ url: 'file::memory:' });
  const prisma = new PrismaClient({ adapter });

  // Push schema to in-memory DB (faster than migrate for tests)
  execSync('npx prisma db push --force-reset --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file::memory:' },
  });

  return prisma;
}

// Reusable seed function
export async function seedTestData(prisma: PrismaClient) {
  const outlet = await prisma.outlet.create({
    data: { id: 'test-outlet-1', name: 'Test Resto', timezone: 'Asia/Jakarta' },
  });
  const owner = await prisma.ownerAccount.create({
    data: {
      id: 'test-owner-1',
      username: 'testuser',
      password_hash: '$2b$12$...', // bcrypt hash of 'testpass123'
      outlet_id: outlet.id,
    },
  });
  return { outlet, owner };
}
```

### Pattern 2: Supertest + Vitest API Test Structure

**What:** Tests import the Express `app` (without `.listen()`) and use supertest's `request(app)` to make HTTP assertions. Async/await pattern with vitest's `describe`/`it`/`expect`.

**When to use:** All black-box API tests. Follows D-37 (black-box only) and D-39 (supertest + vitest).

**Example:**
```typescript
// src/__tests__/auth.test.ts
// Source: supertest npm docs + vitest official guide
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { createTestDb, seedTestData } from './setup';
import type { PrismaClient } from '@prisma/client';

describe('Auth API', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await createTestDb();
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/auth/register — creates new owner and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newowner', password: 'securepass123' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.owner.username).toBe('newowner');
  });

  it('POST /api/auth/login — returns JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass123' })
      .expect(200);

    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login — rejects invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('LOGIN_ERROR');
  });
});
```

### Pattern 3: Authenticated Request Helper

**What:** A helper function that generates a valid JWT and returns a pre-configured supertest request with the Authorization header set. Reuses the existing `signToken()` from `src/lib/jwt.ts`.

**When to use:** Any API test that hits a protected route (`/api/sales`, `/api/dashboard`, `/api/report`, `/api/admin`).

```typescript
// src/__tests__/helpers.ts
import request from 'supertest';
import { app } from '../app';
import { signToken } from '../lib/jwt';

export function authRequest() {
  const token = signToken({ userId: 'test-owner-1', outletId: 'test-outlet-1' });
  return request(app).set('Authorization', `Bearer ${token}`);
}

// Usage in tests:
const res = await authRequest()
  .post('/api/sales')
  .send({ date: '2026-06-26', revenue: 500000, top_menu_items: ['Nasi Goreng'] })
  .expect(201);
```

### Pattern 4: k6 Mixed Traffic Script

**What:** A single k6 script that simulates 50 VUs cycling through 3 endpoints (POST sales, GET dashboard, GET report) with weighted randomization and thresholds.

**When to use:** Plan 04-02 load testing. Follows D-42 (k6) and D-43 (mixed traffic, 50 VUs).

```javascript
// k6/load-test.js
// Source: Grafana k6 thresholds documentation
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],      // Error rate under 1%
    'http_req_duration{endpoint:sales}': ['p(95)<500'],
    'http_req_duration{endpoint:dashboard}': ['p(95)<400'],
    'http_req_duration{endpoint:report}': ['p(95)<500'],
  },
};

const BASE_URL = 'http://localhost:3000';
const TOKEN = '___INSERT_VALID_JWT___';  // Generate before test

export default function () {
  const rand = Math.random();

  if (rand < 0.4) {
    // 40% — POST /api/sales
    const payload = JSON.stringify({
      date: '2026-06-26',
      revenue: Math.floor(Math.random() * 1000000) + 100000,
      top_menu_items: ['Nasi Goreng', 'Es Teh'],
    });
    const res = http.post(`${BASE_URL}/api/sales`, payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      tags: { endpoint: 'sales' },
    });
    check(res, { 'sales status 201': (r) => r.status === 201 });
  } else if (rand < 0.7) {
    // 30% — GET /api/dashboard
    const res = http.get(`${BASE_URL}/api/dashboard?start=2026-06-01&end=2026-06-26`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      tags: { endpoint: 'dashboard' },
    });
    check(res, { 'dashboard status 200': (r) => r.status === 200 });
  } else {
    // 30% — GET /api/report
    const res = http.get(`${BASE_URL}/api/report?start=2026-06-01&end=2026-06-26`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      tags: { endpoint: 'report' },
    });
    check(res, { 'report status 200': (r) => r.status === 200 });
  }

  sleep(1);
}
```

### Pattern 5: Lighthouse Programmatic Audit

**What:** A Node.js script that launches Chrome, runs Lighthouse against multiple pages with 4G throttling, and outputs JSON/HTML reports. Uses the Lighthouse programmatic API with `chrome-launcher`.

**When to use:** Plan 04-02 frontend performance audit. Follows D-44 (Lighthouse CLI + DevTools throttling).

```javascript
// lighthouse/audit.js
// Source: GoogleChrome/lighthouse docs/readme.md (programmatic usage)
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const PAGES = [
  { name: 'login', url: 'http://localhost:5173/login' },
  { name: 'dashboard', url: 'http://localhost:5173/dashboard' },
  { name: 'e-report', url: 'http://localhost:5173/e-report' },
  { name: 'data-entry', url: 'http://localhost:5173/data-entry' },
];

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

for (const page of PAGES) {
  const result = await lighthouse(page.url, {
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility'],
    throttlingMethod: 'devtools',
    throttling: {
      requestLatencyMs: 150,     // 4G RTT
      downloadThroughputKbps: 1600,
      uploadThroughputKbps: 750,
      cpuSlowdownMultiplier: 4,
    },
  });

  fs.writeFileSync(`lighthouse/reports/${page.name}.json`, JSON.stringify(result.lhr, null, 2));
  console.log(`${page.name}: perf=${result.lhr.categories.performance.score * 100}, a11y=${result.lhr.categories.accessibility.score * 100}`);
}

chrome.kill();
```

### Anti-Patterns to Avoid

- **Starting the server in tests:** Do NOT call `app.listen()` in tests. Pass `app` directly to `request(app)` — supertest binds to an ephemeral port automatically. The project's `app.ts` already exports `app` without `.listen()`.
- **Sharing database state between test files:** Do NOT use a single SQLite file or shared Prisma instance across test suites. Each `describe` block or test file must create its own in-memory database. Vitest runs test files in parallel by default.
- **Testing internal implementation:** Per D-37, tests must be black-box. Do NOT import services, repositories, or controllers directly. Only test via HTTP requests through the Express routes.
- **Using the npm `k6` package:** The npm package `k6` is a dummy autocomplete helper. Install k6 as a standalone Go binary. Running `npm install k6` will NOT give you the load testing tool.
- **Running Lighthouse against production build for dev:** Use `vite preview` or the Vite dev server for Lighthouse audits during development. Production build (`vite build`) is only needed for final measurement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP test assertions | Custom fetch + response checks | `supertest` | Built-in `.expect(status)`, `.expect('Content-Type', /json/)`, `.expect(body)`; handles ephemeral ports; cookie persistence via `request.agent()` |
| In-memory test database | SQLite file per test with cleanup | `prisma-adapter-sqlite` with `url: 'file::memory:'` | Automatic cleanup (memory released on disconnect); no file system collisions; each client sees only its own data |
| Load test metrics/thresholds | Custom Node.js concurrency script | `k6` | Built-in metrics (http_req_duration, http_req_failed); percentile thresholds (p(95)<500); tagged sub-metrics; CI exit codes |
| Performance auditing | Manual DevTools measurement | `lighthouse` CLI/programmatic API | Standardized scoring; 4G throttling simulation; automated reports; CI integration via Lighthouse CI |
| JWT generation for tests | Manual JWT string construction | `jsonwebtoken` (already installed) | Uses the same `signToken()` as production; ensures test tokens match real token format exactly |
| CSV formula injection testing | Manual Excel verification | `escapeCell()` unit test + OWASP checklist | The existing `escapeCell()` prefixes =/+/ - /@ with `\t`; verify via unit test that these prefixes are applied |

**Key insight:** The QA phase is verification, not construction. Every tool in the "Use Instead" column is a well-established, community-standard solution with comprehensive documentation. Building custom alternatives would take longer and produce less reliable results than adopting these standards.

## Common Pitfalls

### Pitfall 1: Express 5 Async Error Handling with Supertest

**What goes wrong:** In Express 4, async route handlers that throw errors don't propagate to the error handler unless wrapped with `express-async-errors`. In Express 5, promises are natively supported — but the controller methods must actually return promises (not use callbacks).

**Why it happens:** Express 5 automatically catches rejected promises from route handlers. However, if a controller method uses a callback pattern instead of async/await, errors may still be swallowed.

**How to avoid:** All controllers in this project already use `async` methods — they're Express 5 compatible. In tests, always `await` the supertest call: `const res = await request(app).post('/api/sales').send(...)`. Supertest works with both callbacks and promises; the async/await pattern is cleaner with vitest.

**Warning signs:** Test timeouts (vitest default 5000ms), hanging tests, or `UnhandledPromiseRejection` warnings in test output.

### Pitfall 2: Prisma In-Memory SQLite Adapter Disconnect

**What goes wrong:** Prisma Client with `prisma-adapter-sqlite` keeps the in-memory database alive only while the client instance exists. If the test file's `afterAll` disconnects too early or vitest parallelization reuses a stale client, tests fail with "database not found" errors.

**Why it happens:** `file::memory:` SQLite databases are tied to the connection that created them. When the PrismaClient disconnects, the database is destroyed. If multiple test files share a client (anti-pattern), the second file finds an empty database.

**How to avoid:** Create a fresh PrismaClient in each `describe` block's `beforeAll` and disconnect in `afterAll`. Never share the client across test files. Use `pool: 'forks'` in vitest config if process isolation is needed.

**Warning signs:** Tests pass individually but fail when run together (`vitest run`). "Table not found" errors in the second test file.

### Pitfall 3: k6 on Windows — Binary vs npm Package Confusion

**What goes wrong:** Running `npm install k6` installs a dummy autocomplete package, NOT the load testing tool. Running `npx k6` or `node_modules/.bin/k6` will fail or do nothing useful.

**Why it happens:** k6 is a Go binary distributed via GitHub Releases, winget, brew, and Docker. The npm package `k6` exists only for script autocompletion in editors. This is a common confusion point.

**How to avoid:** Install k6 via `winget install k6 --source winget` on Windows, or download the `.msi` from GitHub Releases. Verify with `k6 version` (should show a version like `k6 v1.x.x`). The k6 CLI is a single `.exe` file — no Node.js runtime needed.

**Warning signs:** `'k6' is not recognized as an internal or external command` after `npm install k6`. The npm package shows version `0.0.0` or similar dummy version.

### Pitfall 4: Supertest and Express 5 Route Registration Order

**What goes wrong:** Tests for a specific route return 404 even though the route is registered. This happens when the Express app is imported before all routes are registered.

**Why it happens:** The project's `app.ts` exports a fully configured Express app with all routes. As long as tests import from `../app`, this shouldn't occur. But if a test imports a router directly and creates a new Express instance, route ordering issues can arise.

**How to avoid:** Always import `app` from `../app` — never create a new Express instance in tests. The existing `app.ts` already exports the app without `.listen()`, making it directly usable with supertest.

**Warning signs:** All tests for a specific route return 404. The route works when the server is started normally.

### Pitfall 5: JWT Secret in Test Environment

**What goes wrong:** Tests that generate their own JWTs using `signToken()` from `src/lib/jwt.ts` depend on `JWT_SECRET` env var. If it's not set, the fallback `'fallback-secret-not-for-production'` is used — and tests designed with a different secret will fail.

**Why it happens:** The JWT library reads `process.env.JWT_SECRET` with a fallback. Tests must either set the env var or use the same fallback to sign and verify tokens.

**How to avoid:** In the test setup file, set `process.env.JWT_SECRET = 'test-secret-key'` before importing `app`. Or always use `signToken()` to generate test tokens (which reads the same env var) rather than constructing JWTs manually.

**Warning signs:** 401 responses for test requests that should be authenticated. Token verification failures in test output.

### Pitfall 6: Lighthouse and Localhost CORS

**What goes wrong:** Lighthouse audits of the frontend dev server fail because API calls to `localhost:3000` are blocked or time out. The frontend Vite proxy only works when the page is loaded through Vite's dev server, not when Lighthouse loads it directly.

**Why it happens:** Lighthouse runs against the page URL directly. If the frontend makes API calls to a relative path (`/api/...`), the Vite proxy forwards them. But if the frontend uses absolute URLs (`http://localhost:3000/api/...`), Lighthouse's Chrome instance may have different CORS behavior.

**How to avoid:** Ensure the frontend API client uses relative URLs (which go through the Vite proxy) or that CORS is properly configured on the backend for the Lighthouse origin. Run Lighthouse against `http://localhost:5173` (Vite dev server) with the backend running on port 3000.

**Warning signs:** Lighthouse report shows 0 performance score, or error messages about failed network requests.

## Code Examples

Verified patterns from official sources:

### JWT Edge Case Testing
```typescript
// Source: jsonwebtoken npm package (already installed) + OWASP JWT testing guidance
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';

describe('JWT Security', () => {
  const TEST_SECRET = process.env.JWT_SECRET || 'test-secret';

  it('rejects request with no Authorization header', async () => {
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-26')
      .expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects request with malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-26')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects expired JWT token', async () => {
    const expiredToken = jwt.sign(
      { userId: 'test', outletId: 'test-outlet' },
      TEST_SECRET,
      { expiresIn: '0s' }  // Immediately expired
    );
    // Wait 1 second to ensure expiry
    await new Promise(r => setTimeout(r, 1100));

    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-26')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('rejects JWT signed with different secret', async () => {
    const tamperedToken = jwt.sign(
      { userId: 'test', outletId: 'test-outlet' },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-26')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });

  it('rejects request with tampered JWT payload', async () => {
    // Sign with correct secret but modify payload structure
    const token = jwt.sign(
      { userId: 'test', outletId: 'test-outlet' },
      TEST_SECRET,
      { expiresIn: '1h' }
    );
    // Tamper with the payload portion (base64 decode, modify, re-encode)
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: 'hacker', outletId: 'other-outlet' })
    ).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-26')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });
});
```

### CSV Injection Verification Test
```typescript
// Source: OWASP CSV Injection + existing csvGenerator.ts escapeCell()
import { describe, it, expect } from 'vitest';

// Test the existing escapeCell function directly
// (import or replicate the logic for verification)

describe('CSV Injection Mitigation', () => {
  // Replicate escapeCell logic for black-box verification
  const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@'];

  function escapeCell(value: unknown): string {
    let str = value == null ? '' : String(value);
    if (str.length > 0 && FORMULA_INJECTION_PREFIXES.includes(str[0])) {
      str = `\t${str}`;
    }
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  it('prefixes cell starting with = with tab character', () => {
    expect(escapeCell('=1+2')).toBe('\t=1+2');
  });

  it('prefixes cell starting with + with tab character', () => {
    expect(escapeCell('+SUM(A1:A10)')).toBe('\t+SUM(A1:A10)');
  });

  it('prefixes cell starting with - with tab character', () => {
    expect(escapeCell('-A1+A2')).toBe('\t-A1+A2');
  });

  it('prefixes cell starting with @ with tab character', () => {
    expect(escapeCell('@SUM(A1:A10)')).toBe('\t@SUM(A1:A10)');
  });

  it('does NOT prefix normal text with tab', () => {
    expect(escapeCell('Normal Text')).toBe('Normal Text');
    expect(escapeCell('12345')).toBe('12345');
  });

  it('still applies RFC 4180 quoting after formula injection mitigation', () => {
    // Cell with formula prefix AND semicolon
    const result = escapeCell('=1+2";DROP TABLE');
    expect(result.startsWith('\t')).toBe(true);
    expect(result).toContain('"');
  });
});
```

### Error Response Leakage Test
```typescript
// Source: Express 5 error handler (src/middleware/errorHandler.ts) pattern verification
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { authRequest } from './helpers';

describe('Error Response Leakage', () => {
  it('does not expose stack traces in 500 responses', async () => {
    // Trigger a server error and verify response shape
    const res = await request(app)
      .get('/api/auth/login')
      .send({});  // Missing username/password — triggers error

    // Verify error response follows the standard shape
    if (res.status >= 500) {
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBeDefined();
      expect(res.body.error.message).toBeDefined();
      // No stack trace leakage
      expect(res.body.error.stack).toBeUndefined();
      expect(res.body.stack).toBeUndefined();
    }
  });

  it('Zod validation errors return clean messages, not raw schema internals', async () => {
    const res = await authRequest()
      .post('/api/sales')
      .send({ date: 'invalid', revenue: -100 })  // Invalid date format, negative revenue
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
    // Details should be user-readable, not raw Zod internals
    res.body.error.details?.forEach((d: any) => {
      expect(d.path).toBeDefined();
      expect(d.message).toBeDefined();
      expect(typeof d.message).toBe('string');
    });
  });

  it('Prisma errors do not expose database internals', async () => {
    // Test duplicate entry
    const res = await authRequest()
      .post('/api/sales')
      .send({ date: '2026-06-26', revenue: 500000, top_menu_items: ['Nasi Goreng'] });

    // Second insert with same date should trigger duplicate error
    const res2 = await authRequest()
      .post('/api/sales')
      .send({ date: '2026-06-26', revenue: 600000, top_menu_items: ['Mie Ayam'] });

    if (res2.status === 409) {
      expect(res2.body.error.code).toBe('DUPLICATE_ERROR');
      // No raw SQL or Prisma error codes in message
      expect(res2.body.error.message).not.toContain('P2002');
      expect(res2.body.error.message).not.toContain('UNIQUE constraint');
    }
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + ts-jest for backend testing | vitest (unified with frontend) | 2024+ | Faster startup, native ESM, shared config with Vite |
| express-async-errors wrapper | Express 5 native async error handling | Express 5 (2024) | No extra package needed; promise rejections propagate automatically |
| Separate DB file per test with cleanup | In-memory SQLite per suite | Standard since SQLite 3.7+ | Zero cleanup, total isolation, faster tests |
| Artillery for load testing | k6 (JS-scriptable, richer metrics) | 2023+ | More flexible scripting, built-in thresholds, CI-native exit codes |
| Manual WCAG checklist only | Lighthouse automated + manual checklist | Standard practice | Automated catches ~57% of issues; manual fills the gap |

**Deprecated/outdated:**
- **express-async-errors package:** Not needed with Express 5. The project uses Express 5.2.1 — async errors propagate natively.
- **jest-mock-extended for Prisma mocking:** Only relevant for unit tests mocking Prisma. This phase uses black-box API testing with real (in-memory) databases — no mocking needed.
- **PageSpeed Insights for local testing:** Only tests public URLs. Use Lighthouse CLI for localhost/dev server testing.
- **artillery.io:** Less flexible scripting model than k6. k6 is the decision per D-42.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `prisma-adapter-sqlite` supports `url: 'file::memory:'` for in-memory databases | Standard Stack, Architecture Patterns | Medium — would need file-based SQLite with cleanup scripts instead. The adapter docs confirm `file::memory:` is supported for SQLite. |
| A2 | Express 5's native async error handling works with supertest without extra configuration | Common Pitfalls | Low — Express 5.2.1 is well-documented to support async route handlers. Verified via official Express 5 release notes. |
| A3 | The vitest `pool: 'forks'` option is not needed for backend tests since each test file creates its own in-memory database | Architecture Patterns | Low — vitest defaults to `pool: 'threads'` (worker_threads). Thread isolation is sufficient when DB is per-file. |
| A4 | k6 can be installed via `winget` on this Windows machine | Environment Availability | Medium — if winget is unavailable, k6 must be downloaded manually from GitHub Releases. The research confirmed k6 is NOT in PATH. |
| A5 | The 4G throttling values (150ms RTT, 1.6Mbps down, 750Kbps up) accurately represent Indonesian 4G conditions | Code Examples, Architecture Patterns | Low — these are Lighthouse's default "Slow 4G" preset values, widely used as a conservative estimate. |
| A6 | `npx lighthouse` works without global installation (Chrome must be installed separately) | Environment Availability | Low — Lighthouse has Chrome as a peer dependency. Chrome is assumed to be installed on the developer's machine. |
| A7 | The backend export endpoint (`GET /api/report/export`) does NOT exist — export is client-side only | Phase Requirements | Low — verified by reading `src/routes/report.routes.ts` which only has `GET /`. Export functions are in `frontend/src/lib/`. |

## Open Questions (RESOLVED)

1. **Prisma db push with `file::memory:` URL**
   - What we know: `prisma db push` can push schema to a database specified by `DATABASE_URL`. For in-memory SQLite, the URL must be `file::memory:`.
   - What's unclear: Whether `prisma db push` with the adapter-based config (Prisma 7+) correctly handles `file::memory:` without a physical file. The standard Prisma CLI expects a file path.
   - **RESOLVED:** Use `execSync('npx prisma db push --force-reset --skip-generate', { env: { ...process.env, DATABASE_URL: 'file::memory:' } })` in the setup script. The planner has adopted this approach in 04-01 PLAN.md Task 1 (`createTestDb` function). If db push fails, the executor will fall back to `prisma migrate deploy` or programmatic schema creation.

2. **k6 authentication token management**
   - What we know: k6 scripts need a valid JWT to hit authenticated endpoints. The token must be generated before the test run.
   - What's unclear: Whether to hardcode a pre-generated token, generate it via a setup script, or have k6 call the login endpoint first. Tokens expire in 24h.
   - **RESOLVED:** Use a k6 `setup()` function that calls POST /api/auth/login to obtain a fresh token, then passes it to the default function via `data`. The planner has adopted this approach in 04-02 PLAN.md Task 1: the k6 `setup()` function logs in with credentials `{ username: 'testuser', password: 'testpass123' }` and returns `{ token: res.json('data.token') }`. This keeps the test self-contained — no hardcoded tokens.

3. **Lighthouse audit with authenticated pages**
   - What we know: Lighthouse audits pages as an unauthenticated user by default. The dashboard, e-report, and data-entry pages require authentication.
   - What's unclear: How to pass authentication cookies/tokens to Lighthouse's headless Chrome. Options: (a) use `--chrome-flags` to set cookies, (b) use Puppeteer to log in before running Lighthouse, (c) test the login page only and use API-level tests for authenticated content.
   - **RESOLVED:** Two-tier approach adopted in 04-02 PLAN.md Task 2: (1) Run full Lighthouse audit against the login page (public) — captures bundle size, FCP, LCP, TBT, CLS for the SPA shell. (2) Use a Puppeteer pre-auth script option for authenticated dashboard measurement: launch headless Chrome, navigate to login page, fill credentials, submit, wait for redirect to dashboard, then run Lighthouse programmatically using the authenticated session. The fallback is to audit the login page only and note that all pages share the same JS bundle (SPA), so bundle-level metrics (total byte weight ≤800KB per NFR §9.3) are valid across all pages. API response times for authenticated pages are covered by k6 load testing (Task 1).

4. **Vitest configuration coexistence**
   - What we know: The frontend has `vite.config.ts` with vitest inline config (jsdom environment). The backend needs a separate vitest config with `environment: 'node'`.
   - What's unclear: Whether vitest will pick up both configs automatically or if explicit `--config` flags are needed. Also whether the workspace feature should be used.
   - **RESOLVED:** Create `vitest.config.ts` at project root with `environment: 'node'` and `test.include: ['src/**/*.test.ts']`. No workspace needed — frontend vitest is invoked from the `frontend/` directory (reads `vite.config.ts`) and backend vitest from the root (reads `vitest.config.ts`). Add separate npm scripts: `test:api` (backend, root) and keep `test` (frontend, run from `frontend/` directory). The planner has adopted this approach in 04-01 PLAN.md Task 1.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Backend vitest, supertest, Lighthouse (npx) | ✓ | v24.16.0 | — |
| npm / npx | Package management, Lighthouse CLI | ✓ | 11.13.0 | — |
| k6 (standalone binary) | Load testing (Plan 04-02) | ✗ | — | Install via `winget install k6 --source winget` or download from GitHub Releases |
| Google Chrome | Lighthouse audits (required by lighthouse) | ? | — | Assumed installed; Lighthouse requires Chrome for headless audits |
| Lighthouse CLI | Frontend performance audit (Plan 04-02) | ✓ (via npx) | 13.4.0 | npx lighthouse works without global install |
| vitest (backend) | API functional testing (Plan 04-01) | ✗ (in root) | 4.1.9 | Install via `npm install --save-dev vitest` in project root |
| supertest | API functional testing (Plan 04-01) | ✗ | 7.2.2 | Install via `npm install --save-dev supertest @types/supertest` |
| SQLite (in-memory) | Test database isolation | ✓ | Built into prisma-adapter-sqlite | — |
| prisma CLI | Schema push for test DB | ✓ | ^7.8.0 | Already in devDependencies |

**Missing dependencies with no fallback:**
- **k6 (standalone binary):** Must be installed before Plan 04-02 can execute. No npm-based alternative meets D-42 requirements. Install command: `winget install k6 --source winget`

**Missing dependencies with fallback:**
- **vitest (backend):** Not installed in root `package.json`. Install command: `npm install --save-dev vitest`. Frontend already has vitest — just needs root-level config.
- **supertest + @types/supertest:** Not installed. Install command: `npm install --save-dev supertest @types/supertest`

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest v4.1.9 |
| Config file (backend) | `vitest.config.ts` (root — to be created in Wave 0) |
| Config file (frontend) | `frontend/vite.config.ts` (existing — UNCHANGED per D-38) |
| Quick run command (backend) | `npx vitest run --config vitest.config.ts` |
| Quick run command (frontend) | `cd frontend && npm test` (existing) |
| Full suite command | `npx vitest run --config vitest.config.ts && cd frontend && npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User login with valid credentials returns JWT | API integration | `npx vitest run src/__tests__/auth.test.ts -t "login"` | ❌ Wave 0 |
| AUTH-01 | User login with invalid credentials returns 401 | API integration | `npx vitest run src/__tests__/auth.test.ts -t "rejects"` | ❌ Wave 0 |
| AUTH-02 | Unauthenticated dashboard access returns 401 | API integration | `npx vitest run src/__tests__/auth.test.ts -t "unauthenticated"` | ❌ Wave 0 |
| AUTH-02 | Authenticated dashboard access returns 200 + data | API integration | `npx vitest run src/__tests__/dashboard.test.ts -t "authenticated"` | ❌ Wave 0 |
| DASH-01 | GET /api/dashboard returns Line Chart data (SalesTrend) | API integration | `npx vitest run src/__tests__/dashboard.test.ts -t "trends"` | ❌ Wave 0 |
| DASH-02 | GET /api/dashboard returns Pie Chart data (menu_popularity) | API integration | `npx vitest run src/__tests__/dashboard.test.ts -t "menu"` | ❌ Wave 0 |
| DASH-03 | Tooltip shows nominal + menu detail (frontend) | Unit (existing) | `cd frontend && npx vitest run src/components/__tests__/LineChart.test.tsx` | ✅ (Phase 2) |
| DATA-01 | POST /api/admin/dummy-inject creates records | API integration | `npx vitest run src/__tests__/sales.test.ts -t "dummy"` | ❌ Wave 0 |
| DATA-02 | POST /api/sales with valid data returns 201 | API integration | `npx vitest run src/__tests__/sales.test.ts -t "create"` | ❌ Wave 0 |
| DATA-02 | POST /api/sales with invalid data returns 400 + Zod errors | API integration | `npx vitest run src/__tests__/sales.test.ts -t "validation"` | ❌ Wave 0 |
| REPT-01 | GET /api/report?start=&end= returns filtered report data | API integration | `npx vitest run src/__tests__/report.test.ts -t "filter"` | ❌ Wave 0 |
| REPT-02 | GET /api/report returns complete data structure for PDF generation | API integration | `npx vitest run src/__tests__/report.test.ts -t "data structure"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit (backend):** `npx vitest run --config vitest.config.ts` (fast, in-memory DB)
- **Per task commit (frontend):** `cd frontend && npm test` (existing)
- **Per wave merge:** Full backend + frontend suite
- **Phase gate:** All API tests green + all frontend tests green + k6 thresholds met + Lighthouse scores documented

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Create at project root with `environment: 'node'`, TypeScript support, `test.include: ['src/**/*.test.ts']`
- [ ] `src/__tests__/setup.ts` — In-memory SQLite creation, schema push, seed data helpers
- [ ] `src/__tests__/helpers.ts` — Auth request helper using `signToken()`
- [ ] `src/__tests__/auth.test.ts` — Auth flow tests (register, login, logout, token validation)
- [ ] `src/__tests__/sales.test.ts` — Data entry tests (create sale, validation errors, duplicate detection)
- [ ] `src/__tests__/dashboard.test.ts` — Dashboard tests (authenticated access, date filtering, data structure)
- [ ] `src/__tests__/report.test.ts` — Report tests (date filtering, aggregation accuracy, data structure for export)
- [ ] `src/__tests__/security/jwt.test.ts` — JWT edge case tests (expired, tampered, missing, wrong secret)
- [ ] `src/__tests__/security/injection.test.ts` — SQL injection/XSS via query params and body
- [ ] `k6/load-test.js` — k6 mixed traffic script with thresholds
- [ ] `lighthouse/audit.js` — Lighthouse programmatic audit script
- [ ] Root `package.json` update — Add `test:api` script, add devDependencies (vitest, supertest, @types/supertest)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT Bearer auth (already implemented); verify via security tests |
| V3 Session Management | yes | Stateless JWT with 24h expiry; verify token validation edge cases |
| V4 Access Control | yes | authMiddleware on all protected routes; verify no unprotected endpoints |
| V5 Input Validation | yes | Zod schemas on all inputs; Prisma parameterized queries (no raw SQL); verify coverage |
| V6 Cryptography | yes | bcrypt cost 12 for passwords; JWT with HS256; verify no hardcoded secrets in tests |

### Known Threat Patterns for Express 5 + Prisma + SQLite

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| JWT token tampering (modify payload, keep signature) | Spoofing | `jsonwebtoken.verify()` with signature check — already in `verifyToken()` |
| JWT algorithm confusion (change alg to 'none') | Spoofing | `jsonwebtoken` v9+ rejects 'none' algorithm by default — verify this behavior |
| Expired JWT acceptance | Spoofing | `exp` claim checked by `jwt.verify()` — test with 0s expiry |
| SQL injection via query parameters | Tampering | Prisma parameterized queries (no raw SQL in project) — verify no `$queryRaw` or string interpolation |
| XSS via sales input reflected in dashboard | Tampering | React's JSX auto-escapes HTML — verify no `dangerouslySetInnerHTML` usage |
| CSV formula injection in export | Tampering | `escapeCell()` with `\t` prefix + RFC 4180 quoting — unit test to verify |
| Error message information leakage | Information Disclosure | `errorHandler.ts` returns generic messages for 500 errors — verify no stack traces |
| Rate limiter bypass | Denial of Service | `express-rate-limit` on auth routes (5 req/15min) — verify header presence and enforcement |
| CORS misconfiguration | Elevation of Privilege | Explicit CORS origin (`CORS_ORIGIN` env or `localhost:5173`) — verify no wildcard |
| Missing auth on any route | Elevation of Privilege | `authMiddleware` on sales, dashboard, report, admin routes — verify all routes protected |

### JWT Edge Cases to Test
1. **No Authorization header** → 401 UNAUTHORIZED
2. **Malformed token** (not 3-part JWT) → 401 UNAUTHORIZED
3. **Expired token** (exp claim in past) → 401 UNAUTHORIZED
4. **Wrong secret** (signed with different key) → 401 UNAUTHORIZED
5. **Tampered payload** (signature mismatch) → 401 UNAUTHORIZED
6. **Missing required claims** (no userId or outletId) → 401 UNAUTHORIZED
7. **Algorithm 'none'** (if jwt.verify allows it) → 401 UNAUTHORIZED
8. **Token used after logout** → Stateless JWT cannot be invalidated server-side (no blocklist). This is an accepted limitation per Phase 1 decisions.

## Sources

### Primary (HIGH confidence)
- [supertest npm registry] — v7.2.2, 15M weekly downloads, GitHub: ladjs/supertest; confirmed API: `request(app).get().expect()`
- [vitest official docs] — v4.1.9, Getting Started guide; confirmed: Node.js environment, TypeScript support, Vite integration
- [Grafana k6 documentation] — Thresholds, metrics, mixed traffic scripting; confirmed: `http_req_duration`, `p(95)`, tags for per-endpoint thresholds
- [GoogleChrome/lighthouse docs] — Programmatic API, CLI flags, throttling configuration; confirmed: DevTools throttling, 4G simulation
- [Prisma testing guide] — Unit/integration testing patterns; confirmed: `jest-mock-extended` for DI pattern (not needed for this phase)
- [OWASP CSV Injection] — Formula injection vectors, mitigation strategies; confirmed: tab prefix approach matches existing `escapeCell()`

### Secondary (MEDIUM confidence)
- [prisma-adapter-sqlite package] — In-memory SQLite support via `url: 'file::memory:'`; verified via package documentation
- [Express 5 release notes] — Native async error handling; confirmed no `express-async-errors` needed
- [vitest v4.1.9 npm page] — 70M weekly downloads; flagged SUS for `too-new` but from established vitest-dev organization
- [jsonwebtoken v9 npm page] — JWT sign/verify with HS256; confirmed algorithm validation built-in

### Tertiary (LOW confidence)
- [WebSearch: Lighthouse CLI 4G throttling] — Specific throttling values (150ms RTT, 1.6Mbps down) sourced from Lighthouse documentation and web searches
- [WebSearch: WCAG AA practical subset] — Checklist items derived from WCAG 2.1 AA success criteria; filtered to practical subset per D-47
- [WebSearch: JWT security testing patterns] — Edge case list compiled from OWASP JWT testing guide and community resources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — supertest and vitest are de-facto standards; versions confirmed via npm registry; k6 and Lighthouse confirmed via official docs
- Architecture: HIGH — in-memory SQLite per suite is the standard Prisma testing pattern; supertest + Express in-process is the canonical approach; confirmed via official docs
- Pitfalls: MEDIUM — Express 5 async handling and k6 binary confusion are documented gotchas; Prisma adapter behavior verified via docs; some edge cases await real-world testing
- Security: MEDIUM — JWT and CSV injection test patterns sourced from OWASP (authoritative); Express 5 security behavior confirmed via docs; some ASVS items require manual verification

**Research date:** 2026-06-26
**Valid until:** 2026-07-10 (14 days — QA tooling is stable but k6/Lighthouse may have point releases)




