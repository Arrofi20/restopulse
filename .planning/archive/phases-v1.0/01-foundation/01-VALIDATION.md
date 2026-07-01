---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x (to be installed in Wave 0 if not present) |
| **Config file** | `jest.config.js` (to be created in Wave 0) |
| **Quick run command** | `npm test -- --testPathPattern="unit"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="unit"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DATA-01 | — | Prisma schema validates without errors | unit | `npx prisma validate` | ⬜ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DATA-01 | — | Migration applies and generates client | unit | `npx prisma migrate status` | ⬜ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | DATA-01 | — | Repository classes compile and are importable | unit | `npx tsc --noEmit` | ⬜ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | AUTH-01 | T-1-02 | Passwords hashed with bcrypt (cost 12) | unit | `npm test -- auth.service.test.ts` | ⬜ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | AUTH-02 | T-1-02 | JWT middleware rejects invalid/missing tokens | unit | `npm test -- auth.middleware.test.ts` | ⬜ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | AUTH-01 | — | Register/login endpoints return correct status codes | integration | `npm test -- auth.routes.test.ts` | ⬜ W0 | ⬜ pending |
| 1-03-01 | 03 | 3 | DATA-02 | — | Zod schema rejects invalid sales input | unit | `npm test -- sales.schema.test.ts` | ⬜ W0 | ⬜ pending |
| 1-03-02 | 03 | 3 | DATA-02 | T-1-03 | Future dates and duplicates rejected | unit | `npm test -- sales.service.test.ts` | ⬜ W0 | ⬜ pending |
| 1-03-03 | 03 | 3 | DATA-02 | — | Sales routes protected by auth middleware | integration | `npm test -- sales.routes.test.ts` | ⬜ W0 | ⬜ pending |
| 1-04-01 | 04 | 4 | DATA-01 | T-1-04 | Dummy injection requires 'HAPUS' confirmation | unit | `npm test -- dummy.service.test.ts` | ⬜ W0 | ⬜ pending |
| 1-04-02 | 04 | 4 | DATA-01 | T-1-05 | REAL data never overwritten by dummy injection | unit | `npm test -- dummy.service.test.ts` | ⬜ W0 | ⬜ pending |
| 1-05-01 | 05 | 5 | AUTH-01 | T-1-01 | Rate limiter blocks after 5 failed attempts | integration | `npm test -- rate.limiter.test.ts` | ⬜ W0 | ⬜ pending |
| 1-05-02 | 05 | 5 | — | — | Error handler returns consistent JSON shape | unit | `npm test -- error.handler.test.ts` | ⬜ W0 | ⬜ pending |
| 1-05-03 | 05 | 5 | — | — | Seed script executes without errors | e2e | `npm run db:seed` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Jest configuration with ts-jest preset
- [ ] `tests/unit/` — directory for unit test stubs
- [ ] `tests/integration/` — directory for integration test stubs
- [ ] `tests/helpers/prisma.ts` — test database setup/teardown helper
- [ ] `npm install -D jest ts-jest @types/jest supertest @types/supertest` — test framework install

*Wave 0 installs test infrastructure before any implementation tasks begin.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| bcrypt hash timing is resistant to timing attacks | AUTH-01 | Requires specialized security tooling beyond jest | Verify bcrypt cost factor is 12; run `node -e "const bcrypt = require('bcrypt'); console.time('hash'); bcrypt.hash('test', 12).then(() => { console.timeEnd('hash'); })"` — should take ~250ms |
| SQLite WAL mode handles concurrent writes | DATA-01 | Requires multi-process simulation | Open two node processes writing to dev.db simultaneously; verify no corruption |

*If none: "All phase behaviors have automated verification."*

---

## Threat Model References

| Threat ID | Description | Mitigation in Plan | Verification |
|-----------|-------------|-------------------|--------------|
| T-1-01 | Brute-force auth attacks | Rate limiter (5 req/15min) | integration test |
| T-1-02 | Plaintext password storage | bcrypt hashing (cost 12) | unit test |
| T-1-03 | Invalid/malicious sales data | Zod validation + business rules | unit test |
| T-1-04 | Accidental dummy data injection | Typed confirmation 'HAPUS' | unit test |
| T-1-05 | Dummy data overwriting real records | data_source enum + soft-replace | unit test |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
