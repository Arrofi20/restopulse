# Lighthouse Performance Audit — RestoPulse

**Generated:** 2026-06-26T11:06:30.243Z

## Configuration

- **Tool:** Lighthouse CLI v13.4.0 (Google Chrome)
- **Throttling:** DevTools — Slow 4G (150ms RTT, 1.6Mbps down, 750Kbps up, 4× CPU slowdown)
- **Categories:** Performance, Accessibility
- **Target NFR:** Page load ≤4 detik, total byte weight ≤800KB (OPENCODE.md §9.3)
- **Target NFR:** API latency ≤500ms @ 50 concurrent (OPENCODE.md §9.4, tested via k6)
- **Frontend server:** Not running ❌
- **Backend server:** Not running ❌
- **Pre-auth:** Puppeteer available

## Results

| Page | Perf Score | A11y Score | FCP | LCP | TBT | CLS | Speed Index | TTI | Total Weight |
|------|-----------|-----------|-----|-----|-----|-----|-------------|-----|-------------|
| login | 0 | 0 | — | — | — | — | — | — | — |
| dashboard | 0 | 0 | — | — | — | — | — | — | — |
| e-report | 0 | 0 | — | — | — | — | — | — | — |
| data-entry | 0 | 0 | — | — | — | — | — | — | — |

## NFR Verification

- **Total byte weight:** Could not determine from available reports (servers may not be running)
- **Performance score:** 0/100 on "login"

## Notes

- All 4 pages share the same SPA bundle — bundle-level metrics (byte weight, FCP, LCP) are valid across all pages.
- Authenticated page API latency is covered by k6 load test (Task 1 of Plan 04-02).
- Accessibility scores are automated Lighthouse checks only — not comprehensive WCAG AA (see Plan 04-03).
- Data-entry route may redirect to /dashboard if not yet implemented (Phase 3 scope).
