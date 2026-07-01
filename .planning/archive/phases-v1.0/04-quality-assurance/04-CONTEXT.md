# Phase 4: Quality Assurance - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers comprehensive quality assurance for RestoPulse — verifying all Must Have features work correctly, performance meets NFRs, the UI is responsive and accessible, security is hardened, and the system passes UAT with the restaurant owner before deployment.

**What this phase delivers:**
1. Black-box API functional tests covering auth, data entry, dashboard, report, and export endpoints
2. Performance benchmarking — k6 load test (50 concurrent, ≤500ms) and Lighthouse frontend audit (≤4s page load on 4G, ≤800KB)
3. Mobile responsiveness and accessibility audit (320px–1440px, WCAG AA practical subset)
4. Security review — JWT edge cases, CSV injection, error leakage, plus verification of existing guards
5. UAT session with restaurant owner and critical bug fixes

**What this phase does NOT deliver:**
- New features or UI changes (bug fixes only)
- Production deployment (Phase 5)
- E2E browser testing (Playwright/Cypress)
- Full WCAG 2.1 AA compliance
- OWASP Top 10 full audit

**Success Criteria (from ROADMAP):**
1. Semua test case untuk FR Must Have lolos (black-box testing)
2. Load test 50 transaksi bersamaan berhasil dengan response time API ≤500ms
3. Page load dasbor ≤4 detik terverifikasi pada koneksi 4G (Lighthouse)
4. UAT oleh pemilik restoran selesai dengan acceptance sign-off

**Requirements tested:** AUTH-01, AUTH-02, DASH-01, DASH-02, DASH-03, DATA-01, DATA-02, REPT-01, REPT-02
</domain>

<decisions>
## Implementation Decisions

### Functional Testing (Plan 04-01)
- **D-37:** Testing approach: black-box API only — test endpoints via HTTP, not internal implementation
- **D-38:** Existing frontend vitest suites (7 files) are KEPT — they already cover chart helpers, hooks, and data fetching
- **D-39:** New API tests use supertest + vitest — test the Express app in-process without starting a server
- **D-40:** Test database: in-memory SQLite per test suite — fresh schema + seed data, total isolation, no cleanup needed
- **D-41:** Test coverage targets: auth flow (register/login/logout/token), data entry (POST /api/sales, validation), dashboard (GET /api/dashboard with date filter), report (GET /api/report, filtering), export (GET /api/report/export?type=pdf/csv)

### Performance & Load Testing (Plan 04-02)
- **D-42:** Load testing tool: k6 — JS-scriptable, built-in metrics/thresholds, CI-friendly
- **D-43:** Load test scenario: mixed traffic — 50 VUs cycling through POST /api/sales + GET /api/dashboard + GET /api/report (realistic usage pattern)
- **D-44:** Frontend performance: Lighthouse CLI with DevTools network throttling (simulated 4G) — measure page load time and bundle size
- **D-45:** Database optimization: verify existing indexes first; only add/index tweak if the 500ms benchmark fails (avoid premature optimization). Current indexes: [outlet_id, date] on DailySales and SalesTrend

### Mobile Responsiveness & Accessibility (Plan 04-03)
- **D-46:** Audit method: Lighthouse accessibility audit + manual checklist (automated metrics + human visual verification)
- **D-47:** Accessibility standard: WCAG AA practical subset — color contrast (≥4.5:1 text), touch target size (≥44px), keyboard navigation, font scaling
- **D-48:** Pages audited: login, dashboard, e-report, data-entry (all owner-facing pages; admin/injector excluded)
- **D-49:** Viewport range: 320px, 768px, 1024px, 1440px — verify layout, tap targets, and export buttons at each breakpoint

### Security Audit (Plan 04-04)
- **D-50:** Audit depth: verify existing guards + add critical gaps (not full OWASP Top 10)
- **D-51:** Audit method: manual code review + targeted security test cases (no SAST/automated scanning)
- **D-52:** Existing guards to verify: JWT auth (all routes protected), Prisma parameterized queries (no raw SQL), Zod input validation coverage, CORS config, rate limiter on auth
- **D-53:** Additional areas to check: JWT edge cases (expired token, tampered payload, missing auth on any route), CSV injection (formula prefix mitigation already in place — verify), error response leakage (no stack traces in production responses)

### UAT Execution & Bug Triage (Plan 04-05)
- **D-54:** UAT structure: guided test script (Bahasa Indonesia) covering key flows + free exploration afterward
- **D-55:** Bug severity tiers: Critical (blocks sign-off), Major (should fix), Minor (defer to v2). Fix all Critical + Major before sign-off.
- **D-56:** Sign-off artifact: one-page checklist in Bahasa Indonesia — each feature tested ✓, bugs found, bugs fixed, owner signature/date

### the agent's Discretion
- Exact test file organization and naming conventions (follow existing __tests__/ pattern)
- k6 script structure and threshold configuration
- Lighthouse audit thresholds and reporting format
- Manual checklist item details for mobile/accessibility
- UAT test script specific steps and scenarios
- Bug tracking format (inline in checklist or separate document)
- Whether to add npm scripts for test/lint/audit commands

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — Core value, business context, constraints (8-week timeline, single-outlet, ≤4s page load, ≤500ms API)
- `.planning/ROADMAP.md` — Phase 4 goals, 5 plans, success criteria, requirements mapping
- `.planning/REQUIREMENTS.md` — Requirement IDs (AUTH-01/02, DASH-01/02/03, DATA-01/02, REPT-01/02) with descriptions
- `.planning/STATE.md` — Current project state, accumulated decisions from Phases 1–3

### Technical Constraints
- `OPENCODE.md` — NFRs: ≤3s dashboard update, ≤4s page load (≤800KB), ≤500ms API latency (50 concurrent), 24pt font, dark mode

### Phase 1–3 Context (Prior Decisions)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Schema design, auth flow, JWT strategy, CQRS-lite, API error format
- `.planning/phases/02-dashboard/02-CONTEXT.md` — UI decisions, component patterns, data fetching (usePolling, useDashboard), TDD RED→GREEN
- `.planning/phases/03-e-report-engine/03-CONTEXT.md` — Report API, PDF/CSV export engines, DateFilter reuse, report data source strategy

### Codebase Reference
- `prisma/schema.prisma` — Database schema (OwnerAccount, Outlet, DailySales, SalesTrend, StatusLog, DailySalesReport)
- `src/app.ts` — Express app setup, route mounting, middleware ordering
- `src/middleware/authMiddleware.ts` — JWT Bearer auth implementation
- `src/middleware/errorHandler.ts` — Centralized error handler (ZodError, Prisma errors, generic)
- `src/middleware/rateLimiter.ts` — Auth rate limiter (5 req/15min)
- `frontend/vite.config.ts` — Vite + vitest config (jsdom environment, test setup file)
- `frontend/src/test/setup.ts` — Vitest global setup (jest-dom matchers)
- `frontend/package.json` — Test scripts: `vitest run` and `vitest` (watch mode)

### Existing Tests
- `frontend/src/hooks/__tests__/useDashboard.test.ts` — Hook test pattern (vi.mock, renderHook, waitFor)
- `frontend/src/hooks/__tests__/usePolling.test.ts` — Polling hook test pattern
- `frontend/src/hooks/__tests__/useReport.test.ts` — Report hook test pattern
- `frontend/src/components/__tests__/DashboardPage.test.tsx` — Component test pattern (jsdom, mock react-chartjs-2)
- `frontend/src/components/__tests__/LineChart.test.tsx` — Chart test pattern (stub canvas, unit-test pure helpers)
- `frontend/src/components/__tests__/PieChart.test.tsx` — Chart test pattern
- `frontend/src/components/__tests__/ui-widgets.test.tsx` — UI widget test pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **vitest + jsdom + @testing-library/react**: Already installed and configured in frontend. TDD RED→GREEN pattern established in Phase 2.
- **supertest**: Not yet installed but recommended for API tests. Compatible with Express 5.
- **k6**: Not yet installed — will be added as a dev tool for load testing.
- **Lighthouse CLI**: Available via `npx lighthouse` or global install — no package dependency needed.
- **Express app export** (`src/app.ts`): App is exported without `.listen()` — ready for supertest in-process testing.
- **JWT lib** (`src/lib/jwt.ts`): signToken and verifyToken functions — can be used to generate test tokens.
- **Zod schemas** (`src/validation/`): Existing validation schemas — test that they reject bad input.

### Established Patterns
- **TDD RED→GREEN**: Write failing tests first, then implement. Established in Phase 2 plans 02-04 and 02-05.
- **Layered monolith**: Repository → Service → Controller → Route — API tests target routes directly.
- **CQRS-lite**: SalesTrend pre-computed on write — dashboard reads are O(1), load testing should verify this.
- **Error format**: `{ success: false, error: { code, message, details } }` — test error responses match this shape.
- **CSV injection mitigation**: escapeCell prefixes =/+/-/@ with tab before quoting — verify in security audit.

### Integration Points
- **Backend test setup**: Need to add vitest config to root package.json (or separate vitest.config.ts), install supertest + vitest as devDependencies
- **Test database**: Use Prisma with SQLite in-memory (`:memory:`) — requires datasource config switch or environment variable
- **k6 integration**: Standalone CLI tool, no code integration needed — just a k6 script file in the project
- **Lighthouse audit**: Runs against the built frontend or dev server — needs a running instance
- **UAT artifacts**: Produce the sign-off checklist document in `.planning/phases/04-quality-assurance/`

### Creative Options
- Backend vitest can run alongside frontend vitest with separate configs or a workspace setup
- k6 thresholds can be configured to auto-fail CI if p(95) > 500ms
- Lighthouse can be scripted to audit all 4 key pages in a single run
- Security test cases can be co-located with functional API tests or in a separate `__tests__/security/` directory

</code_context>

<specifics>
## Specific Ideas

- API tests should follow existing __tests__/ directory convention with co-located test files
- Load test the actual Express app (not a mock) with real SQLite to get accurate DB performance numbers
- Accessibility manual checklist should be in Bahasa Indonesia for the team's use
- Security test cases should include: expired JWT rejection, tampered JWT payload rejection, XSS payloads in sales input, SQL injection attempts via query params
- UAT test script should be in Bahasa Indonesia and cover the full owner journey: login → see dashboard → filter dates → view e-report → export PDF → export CSV → enter daily sales data
- Bug severity definitions: Critical = feature broken/unusable, Major = works but with significant issue, Minor = cosmetic/nice-to-have

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-quality-assurance*
*Context gathered: 2026-06-26*
