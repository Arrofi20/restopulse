---
phase: 03-e-report-engine
verified: 2026-06-26T09:32:30Z
status: human_needed
score: 11/16 must-haves verified
behavior_unverified: 5 # truths present + wired but behavior not exercised by a test
overrides_applied: 0
behavior_unverified_items:
  - truth: "GET /api/report?start=YYYY-MM-DD&end=YYYY-MM-DD returns aggregated report data scoped to the authenticated outlet"
    test: "Start backend + seeded DB, call GET /api/report with a valid JWT and date range, inspect JSON payload"
    expected: "200 { success: true, data: { outlet, period, summary: { totalRevenue, dayCount, topItems }, rows } } scoped to the token's outletId"
    why_human: "Repository/Service/Controller wiring is statically verified and tsc passes, but no HTTP integration test exercises the live endpoint + Prisma aggregation + outlet scoping path"
  - truth: "Invalid date ranges return 400 VALIDATION_ERROR with structured error details"
    test: "Call GET /api/report?start=2026-13-01&end=2026-06-30 with a valid JWT (or start > end)"
    expected: "400 { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: ZodIssue[] } }"
    why_human: "The ZodError -> VALIDATION_ERROR mapping is present in ReportController.getReport, but no test sends malformed dates through the live HTTP layer to confirm the 400 + details payload"
  - truth: "Clicking 'Export PDF' generates and downloads a PDF file with white paper background and dark text"
    test: "Open /e-report in a browser with report data loaded, click 'Export PDF', observe the browser download bar"
    expected: "A file named Laporan_{Outlet}_{Start}_{End}.pdf downloads; opening it shows A4 portrait, white paper, dark text"
    why_human: "pdfGenerator.ts calls doc.save() which triggers a browser download — no jsPDF/browser test exercises the download path; the PDF visual layout (white paper, dark text, print readiness) also needs human inspection"
  - truth: "PDF contains outlet name, report period, summary stats, daily detail table, and footer with generation date"
    test: "Open the downloaded PDF and verify each section"
    expected: "Header (outlet name 18pt + period), summary (Total Omset / Hari Tercatat / Menu Terlaris), daily table, and 'Dibuat pada: <ts> — Halaman X / N' footer on every page"
    why_human: "The code builds every section (doc.text + autoTable + footer loop), but the rendered output's visual correctness (layout, page-break behavior, footer placement) requires opening the actual PDF"
  - truth: "Clicking 'Export CSV' generates and downloads a CSV file with UTF-8 BOM and semicolon delimiter"
    test: "Click 'Export CSV' on /e-report, open the downloaded file in Excel/a hex editor"
    expected: "File starts with EF BB BF (BOM), uses ';' delimiter, opens cleanly in Excel with Indonesian diacritics intact"
    why_human: "csvGenerator.ts prepends \\uFEFF and joins with ';', but URL.createObjectURL + link.click() download path is not testable without a browser; Excel compatibility needs a live spreadsheet open"
human_verification:
  - test: "Verify GET /api/report returns outlet-scoped report data on a live server"
    expected: "200 response with { outlet, period, summary, rows } scoped to the authenticated outlet; 401 without JWT; 400 VALIDATION_ERROR on bad dates"
    why_human: "No HTTP integration test infrastructure; endpoint behavior verified by static compile + wiring grep only"
  - test: "Open /e-report, select each date preset (Harian/Mingguan/Bulanan/Custom), verify the preview updates"
    expected: "Each preset computes the correct range via date-fns; Bulanan is active on first paint; Custom inputs override presets; preview refetches on change"
    why_human: "Component wiring + presets are statically verified, but date-fns range correctness against a live clock and active-preset highlighting need a browser"
  - test: "Download the PDF and inspect its print-readiness (Rupiah formatting, white paper, A4 layout, footer on every page)"
    expected: "A4 portrait, white background, dark text, formatRupiah amounts, 'Halaman X / N' footer on every page, file named Laporan_{Outlet}_{Start}_{End}.pdf"
    why_human: "jsPDF rendering quality and filename behavior are browser-driven; static code inspection confirms the layout calls but not the rendered output"
  - test: "Download the CSV and open it in Excel"
    expected: "UTF-8 BOM present (EF BB BF), ';' delimiter, columns Tanggal/Omset (Rp)/Menu Terlaris/Hari Tercatat, Indonesian diacritics render correctly, cells starting with = + - @ are neutralized"
    why_human: "Excel compatibility and formula-injection neutralization against a live spreadsheet need a browser download + Excel open"
  - test: "Verify export buttons function at viewport mobile 320px (ROADMAP SC 4)"
    expected: "Export buttons are full-width and stack vertically at 320px; daily table scrolls horizontally without overflowing; summary cards stack to one column"
    why_human: "Responsive CSS classes (w-full, flex-col, sm:flex-row, overflow-x-auto, grid-cols-1 sm:grid-cols-3) are present but actual 320px rendering needs a browser DevTools check"
  - test: "Verify export buttons are sticky at the top of the preview on scroll"
    expected: "The export bar remains visible (sticky top-0 z-10 backdrop-blur) while scrolling the daily table"
    why_human: "Sticky CSS is present but visual stickiness during scroll needs a browser"
---

# Phase 3: E-Report Engine — Verification Report

**Phase Goal:** Sistem dapat menyaring data keuangan berdasarkan rentang tanggal dan mengekspor laporan ke PDF serta CSV.
**Verified:** 2026-06-26T09:32:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | GET /api/report returns aggregated report data scoped to the authenticated outlet | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | ReportController.getReport -> ReportService.getReport -> ReportRepository.getReportData chain wired; outlet scoping via req.user!.outletId (ReportController.ts:21); mounted at app.ts:36; tsc passes. No HTTP integration test exercises the live endpoint. |
| 2   | Report response includes outlet name, period, total revenue, day count, top menu items, and daily breakdown rows | ✓ VERIFIED | ReportService.getReport returns `{ outlet: { name }, period: { start, end }, summary: { totalRevenue, dayCount, topItems }, rows }` (ReportService.ts:48-53); ReportRepository builds rows with date/revenue/topMenu/dayCount + topItems array (ReportRepository.ts:84-98). |
| 3   | Invalid date ranges return 400 VALIDATION_ERROR with structured error details | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | ZodError -> 400 VALIDATION_ERROR mapping present (ReportController.ts:31-39); other errors -> 400 REPORT_ERROR (ReportController.ts:40-45). dateRangeSchema reused from sales.schema. No test sends invalid dates through the live HTTP layer. |
| 4   | Owner can select Harian/Mingguan/Bulanan/Custom date range on the E-Report page | ✓ VERIFIED | ReportDateFilter.tsx ships 3 preset buttons (Harian/Mingguan/Bulanan) + 2 native date inputs for Custom (lines 35-57, 116-132); defaultReportDateRange() returns Bulanan (lines 62-67); active preset highlighted via amber-400 (lines 96-106). |
| 5   | Report preview displays outlet name, report period, total revenue, day count, top menu items, and daily breakdown table | ✓ VERIFIED | EReportPage.tsx composes periodLabel (line 30-32), ReportSummaryCards (3 cards: Total Omset/Hari Tercatat/Menu Terlaris), ReportDailyTable (4-column daily breakdown) — all wired and substantive. |
| 6   | Export buttons are sticky at the top-right of the preview and full-width on mobile | ✓ VERIFIED | ExportButtons.tsx uses `sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm` (line 27), `flex flex-col gap-2 sm:flex-row sm:justify-end` (line 28), `w-full ... sm:w-auto` (lines 35, 45). |
| 7   | Report date state is independent of dashboard date state (D-21) | ✓ VERIFIED | EReportPage owns its own `useState(defaultReportDateRange)` (EReportPage.tsx:26); no shared store; useReport receives dateRange as prop (useReport.ts:35). Dashboard page state is separate. |
| 8   | Clicking 'Export PDF' generates and downloads a PDF file with white paper background and dark text | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | ExportButtons PDF onClick calls generateReportPDF(data) (ExportButtons.tsx:32); pdfGenerator.ts builds A4 portrait jsPDF with dark text colors (textColor 20) on white paper (pdfGenerator.ts:35-118); doc.save() triggers browser download (line 118). No test exercises the jsPDF/doc.save download path. |
| 9   | PDF contains outlet name, report period, summary stats, daily detail table, and footer with generation date | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | pdfGenerator.ts builds: outlet name header (line 40), period line (line 44), summary stats (lines 50-52), daily table via autoTable (lines 62-98), per-page footer loop with `Dibuat pada: ... Halaman X / N` (lines 105-114). Code produces all sections; rendered PDF visual correctness needs human inspection. |
| 10  | PDF file name follows Laporan_{OutletName}_{StartDate}_{EndDate}.pdf convention | ✓ VERIFIED | pdfGenerator.ts:117-118 sanitizes outlet name (`/[^A-Za-z0-9]+/g` -> '_' with edge trim, 'Outlet' fallback) and calls `doc.save(\`Laporan_${safeName}_${start}_${end}.pdf\`)`. |
| 11  | PDF uses Rupiah formatting from formatRupiah() | ✓ VERIFIED | pdfGenerator.ts imports formatRupiah (line 18) and applies it to totalRevenue (line 50) and each row.revenue (line 67). formatRupiah defined in frontend/src/lib/format.ts:17. |
| 12  | Clicking 'Export CSV' generates and downloads a CSV file with UTF-8 BOM and semicolon delimiter | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | ExportButtons CSV onClick calls generateReportCSV(data) (ExportButtons.tsx:42); csvGenerator.ts prepends `\uFEFF` BOM (line 81-82), joins cells with ';' (line 75), joins rows with '\r\n' (line 78), triggers download via URL.createObjectURL + link.click() (lines 84-95). No test exercises the Blob/download path. |
| 13  | CSV contains one row per day with columns: Tanggal, Omset (Rp), Menu Terlaris, Hari Tercatat | ✓ VERIFIED | csvGenerator.ts:22 defines CSV_HEADERS = ['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Hari Tercatat']; line 72-76 maps each data row to those 4 cells. |
| 14  | CSV file name follows Laporan_{OutletName}_{StartDate}_{EndDate}.csv convention | ✓ VERIFIED | csvGenerator.ts:90-91 sanitizes outlet name (`/[^a-zA-Z0-9]/g` -> '_', 'Outlet' fallback) and sets `link.download = \`Laporan_${safeName}_${start}_${end}.csv\``. |
| 15  | Special characters in data are escaped correctly to prevent CSV corruption | ✓ VERIFIED | csvGenerator.ts escapeCell (lines 43-57) applies RFC 4180 quoting for values containing ';', '"', or '\n' (doubling internal quotes, line 52-54). |
| 16  | CSV injection (formula injection) is mitigated by prefixing risky leading characters | ✓ VERIFIED | csvGenerator.ts FORMULA_INJECTION_PREFIXES = ['=','+','-','@'] (line 28); escapeCell prefixes such cells with '\t' BEFORE quoting (lines 48-50). |

**Score:** 11/16 truths verified (5 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/repositories/ReportRepository.ts` | Aggregates SalesTrend + DailySales | ✓ VERIFIED | 118 lines; getReportData queries both tables, parses menu_popularity, computes topItems + per-day rows; re-exported from index.ts:6-7 |
| `src/services/ReportService.ts | Validates dates + orchestrates + formats | ✓ VERIFIED | 55 lines; dateRangeSchema.parse, UTC boundaries, summary aggregates, outlet name resolution, structured return |
| `src/controllers/ReportController.ts` | Express handler with error mapping | ✓ VERIFIED | 48 lines; getInstance factory, ZodError -> VALIDATION_ERROR, other -> REPORT_ERROR, outlet scoping via req.user.outletId |
| `src/routes/report.routes.ts` | GET / behind authMiddleware | ✓ VERIFIED | 14 lines; router.get('/', authMiddleware, ...) |
| `src/app.ts` | Mount /api/report between /api/dashboard and /api/admin | ✓ VERIFIED | Line 36: app.use('/api/report', reportRoutes) — between dashboard (35) and admin (37) |
| `frontend/src/types/report.ts` | ReportRow/ReportData/ReportResponse + DateRange re-export | ✓ VERIFIED | 31 lines; all interfaces present |
| `frontend/src/hooks/useReport.ts` | Polls GET /api/report every 30s | ✓ VERIFIED | 64 lines; usePolling(fetchReport, 30000), useCallback keyed on dateRange, refresh() |
| `frontend/src/hooks/__tests__/useReport.test.ts` | 4 behavioral tests | ✓ VERIFIED | 111 lines; 4 tests pass (vitest run: 32/32 passed) |
| `frontend/src/components/report/ReportDateFilter.tsx` | Harian/Mingguan/Bulanan/Custom presets | ✓ VERIFIED | 135 lines; 3 presets + custom date inputs + defaultReportDateRange() |
| `frontend/src/components/report/ReportSummaryCards.tsx` | 3 summary cards responsive grid | ✓ VERIFIED | 69 lines; Total Omset (amber-400 text-3xl), Hari Tercatat, Menu Terlaris; shimmer + empty states |
| `frontend/src/components/report/ReportDailyTable.tsx` | Daily breakdown table, overflow-x-auto | ✓ VERIFIED | 74 lines; 4 columns, skeleton + empty states, overflow-x-auto wrapper |
| `frontend/src/components/report/ExportButtons.tsx` | Sticky export bar, both engines wired | ✓ VERIFIED | 52 lines; imports generateReportPDF + generateReportCSV; both onClick handlers wired; pdfDisabled/csvDisabled = !data |
| `frontend/src/pages/EReportPage.tsx` | Full preview page (placeholder replaced) | ✓ VERIFIED | 62 lines; composes useReport + all report components; independent useState; no "E-Report akan tersedia" placeholder text |
| `frontend/src/lib/pdfGenerator.ts` | A4 PDF with header/summary/table/footer | ✓ VERIFIED | 122 lines; jsPDF + autoTable; white paper + dark text (D-25b); sanitized filename; two-pass footer stamping |
| `frontend/src/lib/csvGenerator.ts` | UTF-8 BOM + semicolon + escape + download | ✓ VERIFIED | 100 lines; BOM prefix, ';' delimiter, CRLF, escapeCell with formula-injection guard, URL.revokeObjectURL |
| `frontend/package.json` | jspdf + jspdf-autotable deps | ✓ VERIFIED | `"jspdf": "^4.2.1"`, `"jspdf-autotable": "^5.0.8"` present |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| ReportController.getReport | ReportService.getReport -> ReportRepository.getReportData | constructor injection + getInstance factory | ✓ WIRED | ReportController.ts:15 getInstance wires ReportService(new ReportRepository()); service calls repo.getReportData (ReportService.ts:29) |
| Route mount /api/report in app.ts | between /api/dashboard and /api/admin | app.use('/api/report', reportRoutes) | ✓ WIRED | app.ts:36, between dashboard (35) and admin (37) |
| authMiddleware on all report routes | GET / | router.get('/', authMiddleware, ...) | ✓ WIRED | report.routes.ts:8-12 |
| useReport hook | GET /api/report -> ReportController | get<ReportResponse>('/report?start=...&end=...') | ✓ WIRED | useReport.ts:42-44; apiClient attaches Bearer token; verified by useReport.test.ts Test 1 |
| EReportPage | ReportDateFilter (independent date state) | useState(defaultReportDateRange) + onChange={setDateRange} | ✓ WIRED | EReportPage.tsx:26,43 |
| EReportPage | ExportButtons (sticky, mobile responsive) | `<ExportButtons data={data} />` | ✓ WIRED | EReportPage.tsx:46 |
| EReportPage | ReportSummaryCards + ReportDailyTable | direct component composition | ✓ WIRED | EReportPage.tsx:49,59 |
| ExportButtons onClick PDF | generateReportPDF(data) -> jsPDF + autoTable -> browser download | onClick handler + import | ✓ WIRED | ExportButtons.tsx:15,32; pdfGenerator.ts:34-118 |
| ExportButtons onClick CSV | generateReportCSV(data) -> Blob + URL.createObjectURL -> download | onClick handler + import | ✓ WIRED | ExportButtons.tsx:16,42; csvGenerator.ts:71-99 |
| ReportData shape | useReport -> EReportPage -> ExportButtons -> pdfGenerator/csvGenerator | typed import chain | ✓ WIRED | types/report.ts imported across useReport.ts, EReportPage.tsx, ExportButtons.tsx, pdfGenerator.ts, csvGenerator.ts |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| ReportSummaryCards | summary.totalRevenue / dayCount / topItems | useReport(data) -> GET /api/report -> ReportRepository.prisma.salesTrend.findMany + dailySales.findMany | Yes (live Prisma queries, not static) | ✓ FLOWING |
| ReportDailyTable | rows[].date/revenue/topMenu/dayCount | useReport(data).rows -> same API | Yes | ✓ FLOWING |
| pdfGenerator | data: ReportData (all fields) | EReportPage passes useReport data to ExportButtons -> generateReportPDF | Yes (chained from API) | ✓ FLOWING |
| csvGenerator | data: ReportData | same chain | Yes | ✓ FLOWING |
| EReportPage periodLabel | data.outlet.name + data.period | useReport(data) | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Frontend build (tsc -b + vite build) | `cd frontend && npm run build` | exit 0; dist/ produced (891 kB main chunk + expected chunk-size warning) | ✓ PASS |
| Backend type check | `npx tsc --noEmit --skipLibCheck` | exit 0, no output | ✓ PASS |
| useReport hook behavioral tests | `cd frontend && npx vitest run` | 32/32 tests pass across 7 files (useReport.test.ts: 4/4) | ✓ PASS |
| jsPDF + jspdf-autotable installed | `grep jspdf frontend/package.json` | both deps present | ✓ PASS |
| /e-report route registered | `grep -n "e-report" frontend/src/App.tsx` | line 48: path="/e-report" -> ProtectedRoute + EReportPage | ✓ PASS |
| PDF/CSV browser download trigger | (requires running browser) | n/a | ? SKIP — no runnable browser entry; routed to human verification |
| GET /api/report live response | (requires running server + seeded DB) | n/a | ? SKIP — routed to human verification |

### Probe Execution

Step 7c: SKIPPED — no probe scripts declared in PLAN/SUMMARY and no `scripts/*/tests/probe-*.sh` present. Phase verification relied on tsc + vitest + build + grep, all of which passed.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| REPT-01 | 03-01, 03-02 | Sistem menyaring, menghitung total pendapatan, menyusun lembar ringkasan laporan di layar sesuai filter rentang tanggal | ✓ SATISFIED | GET /api/report endpoint (ReportRepository/Service/Controller/route/app.ts mount) + E-Report preview page (ReportDateFilter, ReportSummaryCards, ReportDailyTable, useReport) all implemented and wired. Live HTTP behavior routed to human UAT. |
| REPT-02 | 03-03 | Sistem mengonversi struktur data laporan di layar menjadi file PDF siap cetak | ✓ SATISFIED | pdfGenerator.ts produces A4 portrait PDF with white paper + dark text + Rupiah formatting + sanitized filename; ExportButtons PDF onClick wired. Visual print-readiness routed to human UAT. |
| REPT-03 | 03-04 | Sistem mengekstrak data mentah ringkasan penjualan harian ke CSV (Excel) | ✓ SATISFIED | csvGenerator.ts produces UTF-8 BOM + semicolon-delimited + CRLF + formula-injection-guarded CSV; ExportButtons CSV onClick wired. Excel compatibility routed to human UAT. |

**Orphaned requirements:** None. All three declared requirement IDs (REPT-01, REPT-02, REPT-03) appear in PLAN frontmatter and are satisfied by implementation evidence.

**Documentation discrepancy (WARNING, not a gap):** REQUIREMENTS.md places REPT-03 under "v2 Requirements (Deferred to future release)" and the traceability table only lists REPT-01 and REPT-02 for Phase 3. However, ROADMAP.md Phase 3 explicitly lists REPT-03 in its `Requirements:` field and Success Criterion 3 mandates CSV export. The implementation satisfies REPT-03 fully. The REQUIREMENTS.md v1/v2 split is a documentation inconsistency to reconcile at milestone audit — it does not block the phase because the ROADMAP (the contract) includes REPT-03 in Phase 3.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER markers found in any phase-modified file | ℹ️ Info | Clean |
| — | — | No `return null`/`return []`/`=> {}` stubs in phase components | ℹ️ Info | Clean |
| — | — | No hardcoded empty data props at call sites | ℹ️ Info | Clean |

### Human Verification Required

Six human-verification items are listed in the frontmatter `human_verification` section and the `behavior_unverified_items` list. Summary:

1. **Live HTTP endpoint behavior** — start backend with seeded DB, exercise GET /api/report (200 valid, 401 no-JWT, 400 bad dates).
2. **Date preset correctness** — click Harian/Mingguan/Bulanan/Custom in /e-report, verify ranges + active highlighting against a live clock.
3. **PDF print-readiness** — download PDF, verify A4 layout, white paper, Rupiah formatting, footer on every page, filename convention.
4. **CSV Excel compatibility** — download CSV, open in Excel, verify BOM, ';' delimiter, Indonesian diacritics, formula-injection neutralization.
5. **Mobile 320px viewport (ROADMAP SC 4)** — verify export buttons full-width, daily table horizontal scroll, summary cards stack.
6. **Sticky export bar** — verify the export bar stays visible during scroll.

### Gaps Summary

No gaps blocking goal achievement. All 16 must-have truths are either fully verified (11) by static code inspection + passing build/tests, or present and wired with behavior not yet exercised by a test (5). The 5 behavior-unverified truths cluster around two runtime paths that cannot be exercised without a live browser/server: (a) the live HTTP endpoint + Prisma aggregation + Zod error mapping, and (b) the client-side browser-download trigger for PDF and CSV. Both are appropriate for the end-of-phase human checkpoint (Phase 4 UAT also covers these per ROADMAP Phase 4 success criteria 1 + 4).

All three declared requirements (REPT-01, REPT-02, REPT-03) are satisfied by implementation evidence. A minor documentation discrepancy exists in REQUIREMENTS.md (REPT-03 listed under v2 deferred while ROADMAP Phase 3 includes it) — this is informational and does not block the phase.

---

_Verified: 2026-06-26T09:32:30Z_
_Verifier: the agent (gsd-verifier)_
