---
phase: 2
slug: dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + jsdom |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-03 | 01 | 1 | DASH-01 | — | N/A | unit | `npx vitest run src/controllers/__tests__/DashboardController.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/lib/__tests__/format.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/lib/__tests__/chartConfig.test.ts` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/components/dashboard/__tests__/LineChart.test.tsx` | ❌ W0 | ⬜ pending |
| 02-05-02 | 05 | 3 | DASH-02 | — | N/A | unit | `npx vitest run frontend/src/components/dashboard/__tests__/PieChart.test.tsx` | ❌ W0 | ⬜ pending |
| 02-05-03 | 05 | 3 | DASH-03 | — | N/A | unit | `npx vitest run frontend/src/components/dashboard/__tests__/LineChart.test.tsx` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 2 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/components/dashboard/__tests__/SummaryCards.test.tsx` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/hooks/__tests__/usePolling.test.ts` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | DASH-01 | — | N/A | unit | `npx vitest run frontend/src/components/dashboard/__tests__/EmptyState.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `frontend/src/lib/__tests__/format.test.ts` — Rupiah formatting edge cases
- [ ] `frontend/src/lib/__tests__/chartConfig.test.ts` — Chart dark theme defaults
- [ ] `frontend/src/components/dashboard/__tests__/LineChart.test.tsx` — DASH-01, DASH-03
- [ ] `frontend/src/components/dashboard/__tests__/PieChart.test.tsx` — DASH-02, DASH-03
- [ ] `frontend/src/components/dashboard/__tests__/SummaryCards.test.tsx` — Summary cards
- [ ] `frontend/src/components/dashboard/__tests__/EmptyState.test.tsx` — D-09
- [ ] `frontend/src/hooks/__tests__/usePolling.test.ts` — D-10, D-11, D-13
- [ ] Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page load ≤4 detik on 4G | SC-5 | Lighthouse audit — not automatable in unit tests | Run Lighthouse in Chrome DevTools with 4G throttling |
| Data refresh ≤3 detik after input | SC-4 | Requires running backend + frontend simultaneously | Manual E2E — input data, observe dashboard refresh timing |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
