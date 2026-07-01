# Phase 4: Quality Assurance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26
**Phase:** 04-quality-assurance
**Areas discussed:** Functional testing strategy, Performance testing methodology, Mobile & accessibility audit, Security audit scope, UAT execution & bug triage

---

## Functional testing strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Black-box API only | Test all endpoints via HTTP (supertest). Matches ROADMAP "black-box testing" criterion. Fastest, no backend refactoring. | ✓ |
| Backend unit tests + API integration | Add vitest to backend for service/repository tests plus API integration. More thorough but requires backend test infra setup. | |
| Full E2E with Playwright | Browser-level E2E for all user flows. Real browser but slower, heavier setup. | |

**User's choice:** Black-box API only (Recommended)
**Notes:** Chart rendering and frontend features stay with existing vitest suites. New API tests added via supertest + vitest with in-memory SQLite per suite.

---

## Performance testing methodology

| Option | Description | Selected |
|--------|-------------|----------|
| k6 | Modern load testing tool, JS-scriptable, built-in metrics/thresholds, CI-friendly. | ✓ |
| autocannon | Node.js native HTTP benchmarking. Simpler, fewer features. | |
| Artillery | YAML-based config, supports scenarios. More feature-rich but heavier. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed traffic scenario | 50 VUs cycling through POST /api/sales, GET /api/dashboard, GET /api/report. Realistic. | ✓ |
| POST /api/sales only | Focus on write-heavy path only. Simpler but incomplete. | |
| All endpoints equally | Distribute across all routes. Broader but dilutes concurrency. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Lighthouse CLI + DevTools throttling | Run Lighthouse CLI with network throttling for accurate 4G simulation. Verify bundle size. | ✓ |
| Lighthouse DevTools only | Manual audit via Chrome DevTools. Faster but less accurate. | |
| Manual browser resize | No tooling — visual check only. Simplest but no automation. | |

**User's choice:** k6 + Mixed traffic + Lighthouse CLI. Database optimization: verify existing indexes first, only optimize if 500ms benchmark fails.

---

## Mobile & accessibility audit

| Option | Description | Selected |
|--------|-------------|----------|
| Lighthouse accessibility + manual checklist | Automated metrics + human visual verification. Covers both dimensions. | ✓ |
| Automated only (axe-core/Lighthouse) | Automated scanning only. Misses visual/layout issues. | |
| Manual visual audit only | No automation. Most thorough for layout but slow. | |

| Option | Description | Selected |
|--------|-------------|----------|
| WCAG AA practical subset | Color contrast, touch targets, keyboard nav, font scaling. Realistic for timeline. | ✓ |
| Full WCAG 2.1 AA | Complete compliance including screen readers. More work, may need UI changes. | |
| Project-specific only | Just OPENCODE.md constraints (24pt font, dark mode). No external standard. | |

**User's choice:** Lighthouse + manual checklist, WCAG AA practical subset. Audit all key pages: login, dashboard, e-report, data-entry.

---

## Security audit scope

| Option | Description | Selected |
|--------|-------------|----------|
| Verify existing + add critical gaps | Code-review existing guards, add missing checks. Practical scope. | ✓ |
| OWASP Top 10 full audit | Full review including CSRF, CSP, dependency audit. Comprehensive but heavy. | |
| Verify existing only | Confirm what's there works. Fastest but may miss edge cases. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Manual code review + targeted test cases | Read middleware/routes/schemas, write security test cases. Fits vitest workflow. | ✓ |
| Automated SAST (npm audit, semgrep) | Run scanners for patterns. Fast but generates noise. | |
| Both — manual + SAST | Combined approach. Most thorough but may overwhelm. | |

**User's choice:** Verify existing + add critical gaps via manual code review + targeted tests. Additional areas: JWT edge cases, CSV injection, error leakage.

---

## UAT execution & bug triage

| Option | Description | Selected |
|--------|-------------|----------|
| Guided test script + free exploration | Bahasa Indonesia test script for key flows, then free exploration. | ✓ |
| Structured test script only | Step-by-step checklist only. Easier to track but may miss issues. | |
| Free exploration only | Owner uses app naturally. More realistic but harder to cover all features. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Simple severity tiers | Critical/Major/Minor. Fix Critical + Major before sign-off. Minor deferred. | ✓ |
| Fix everything found | All bugs regardless of severity. Thorough but may delay deployment. | |
| Owner decides priority | Owner selects which to fix. Maximum stakeholder control but needs follow-up. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Simple sign-off checklist | One-page Bahasa Indonesia: features ✓, bugs found, bugs fixed, signature. | ✓ |
| Verbal confirmation only | No paperwork. Simplest but no record. | |
| Full UAT report | Formal report with cases, screenshots, bug log, letter. Overkill. | |

**User's choice:** Guided script + free exploration, severity tiers (fix Critical + Major), one-page sign-off checklist in Bahasa Indonesia.

---

## the agent's Discretion

- Test file organization and naming (follow existing __tests__/ pattern)
- k6 script structure and thresholds
- Lighthouse audit thresholds and reporting format
- Manual checklist item details for mobile/accessibility
- UAT test script specific steps and scenarios
- Bug tracking format (inline checklist or separate document)
- npm scripts for test/lint/audit commands

## Deferred Ideas

None — discussion stayed within phase scope
