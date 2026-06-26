---
status: testing
phase: 03-e-report-engine
source: [03-VERIFICATION.md]
started: 2026-06-26T09:32:30Z
updated: 2026-06-26T09:32:30Z
---

## Current Test

number: 1
name: Verify GET /api/report returns outlet-scoped report data on a live server
expected: |
  Start backend with seeded DB and call GET /api/report with a valid JWT and date range.
  200 response with { success: true, data: { outlet, period, summary: { totalRevenue, transactionCount, topItems }, rows } } scoped to the token's outletId.
  401 without JWT; 400 VALIDATION_ERROR with ZodIssue[] details on malformed dates (e.g. start > end, start=2026-13-01).
awaiting: user response

## Tests

### 1. Live HTTP endpoint behavior (GET /api/report)
expected: 200 with outlet/period/summary/rows scoped to authenticated outlet; 401 without JWT; 400 VALIDATION_ERROR on bad dates
result: [pending]

### 2. Date preset correctness at live clock
expected: Click Harian/Mingguan/Bulanan/Custom in /e-report; each preset computes correct range via date-fns; Bulanan active on first paint; Custom inputs override presets; preview refetches on change
result: [pending]

### 3. PDF print-readiness (download + visual)
expected: A4 portrait, white background, dark text, formatRupiah amounts, 'Halaman X / N' footer on every page, file named Laporan_{Outlet}_{Start}_{End}.pdf
result: [pending]

### 4. CSV Excel compatibility (download + open)
expected: UTF-8 BOM present (EF BB BF), ';' delimiter, columns Tanggal/Omset (Rp)/Menu Terlaris/Jumlah Transaksi, Indonesian diacritics render correctly, cells starting with = + - @ are neutralized
result: [pending]

### 5. Mobile 320px viewport (ROADMAP SC 4)
expected: Export buttons full-width and stack vertically at 320px; daily table scrolls horizontally without overflowing; summary cards stack to one column
result: [pending]

### 6. Sticky export bar during scroll
expected: Export bar remains visible (sticky top-0 z-10 backdrop-blur) while scrolling the daily table
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps