---
phase: 03-e-report-engine
plan: 04
subsystem: ui
tags: [react, vite, typescript, csv, export, bom, excel, indonesia, formula-injection]

# Dependency graph
requires:
  - phase: 03-e-report-engine
    provides: E-Report preview page (EReportPage), ExportButtons sticky action area with data prop, ReportData shape (outlet/period/summary/rows), formatRupiah id-ID currency formatter
  - phase: 03-e-report-engine (Plan 03-03)
    provides: ExportButtons component with direct-import export-engine pattern (pdfGenerator), pdfDisabled = !data gating pattern, sanitized-filename convention (Laporan_{Outlet}_{Start}_{End})
provides:
  - Client-side CSV export engine (frontend/src/lib/csvGenerator.ts) — generateReportCSV(ReportData) producing a UTF-8 BOM prefixed, semicolon-delimited, Windows-CRLF Excel-compatible CSV and triggering a browser download
  - Wired ExportButtons CSV button — enabled when report data is present, calls generateReportCSV on click; both PDF and CSV buttons now active
  - Formula-injection mitigation in CSV cells (tab-prefix for leading =, +, -, @) — T-03-12 mitigate
  - ObjectURL revocation after download to prevent memory leak — T-03-14 mitigate
affects: [phase verification (CSV success criterion), 03-USER-SETUP (none — purely client-side)]

# Tech tracking
tech-stack:
  added: []  # no new packages — custom generator, no external CSV library (RESEARCH.md recommendation)
  patterns:
    - "Custom client-side CSV generator (~30 LOC) with UTF-8 BOM + semicolon delimiter + Windows CRLF for Indonesian-locale Excel compatibility — no external CSV library needed"
    - "CSV formula-injection mitigation: prefix cells whose first char is =, +, -, or @ with a tab character (`\\t`) before RFC 4180 quoting — neutralizes Excel formula execution while remaining invisible in the spreadsheet (T-03-12)"
    - "RFC 4180 cell escaping: wrap values containing `;`, `\"`, or `\\n` in double quotes and double internal quotes — applied AFTER the formula-injection tab prefix so the leading-char test sees the original character"
    - "Filename sanitization: non-alphanumeric -> '_' with literal 'Outlet' fallback — mirrors the pdfGenerator.ts pattern (T-03-11)"
    - "ObjectURL revocation: URL.revokeObjectURL(url) immediately after link.click() to prevent memory leaks (T-03-14, RESEARCH.md Pitfall 4)"
    - "Direct-import export engine pattern continued: ExportButtons imports generateReportCSV directly rather than receiving an onExportCSV prop — export engines own their trigger logic"

key-files:
  created:
    - frontend/src/lib/csvGenerator.ts
  modified:
    - frontend/src/components/report/ExportButtons.tsx

key-decisions:
  - "No external CSV library — a custom generator of ~30 LOC is sufficient and avoids a supply-chain dependency (RESEARCH.md recommendation). Plain string concatenation with semicolon join + CRLF is the entire engine."
  - "Formula-injection tab prefix applied BEFORE RFC 4180 quoting so the leading-character test sees the original first character; if a value starts with `=`, `+`, `-`, or `@` it becomes `\\t=...` and is then quoted only if it also contains `;`, `\"`, or newline. The tab is invisible in Excel but neutralizes the formula trigger (T-03-12)."
  - "Filename sanitization regex `/[^a-zA-Z0-9]/g` -> `'_'` (single-char class, no `+` quantifier) with `'Outlet'` fallback — mirrors the plan's literal spec. Slightly different from pdfGenerator's `/[^A-Za-z0-9]+/g` with `^_+|_+$` trim, but both satisfy T-03-11; kept the plan's exact form per 'execute exactly as written'."
  - "CSV button enabled state flipped from the Plan 03-03 placeholder `csvDisabled = true` to `csvDisabled = !data`, matching the PDF button's gating pattern — both buttons are now active when report data is present (REPT-03)."

patterns-established:
  - "Export engine = pure function module imported directly by the UI component (continued from 03-03); the second engine (CSV) confirms the pattern as the convention for any future export format"
  - "CSV hardening checklist for any future CSV-producing code: UTF-8 BOM + semicolon delimiter (id-ID locale) + CRLF line endings + formula-injection tab-prefix + RFC 4180 quoting + ObjectURL revocation"

requirements-completed: [REPT-03]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Client-side CSV export engine producing a UTF-8 BOM prefixed, semicolon-delimited, Windows-CRLF Excel-compatible CSV with columns Tanggal, Omset (Rp), Menu Terlaris, Hari Tercatat and one row per day"
    requirement: "REPT-03"
    verification:
      - kind: integration
        ref: "cd frontend && npm run build (tsc -b && vite build) exits 0"
        status: pass
      - kind: integration
        ref: "cd frontend && npm test (32 tests, 7 files) all pass — no regressions"
        status: pass
      - kind: manual_procedural
        ref: "grep -c 'generateReportCSV' frontend/src/lib/csvGenerator.ts -> 1; grep -c 'uFEFF' -> 1 (BOM); grep -c 'text/csv' -> 1; escapeCell + FORMULA_INJECTION_PREFIXES present"
        status: pass
    human_judgment: true
    rationale: "Build + grep confirm the engine compiles, is wired, and contains the BOM/delimiter/escaping/injection-guard primitives, but the actual downloaded file's Excel compatibility (correct encoding, semicolon parsing, formula-injection neutralization against a live Excel) requires a live browser download + spreadsheet open."
  - id: D2
    description: "Downloaded file named Laporan_{Outlet}_{Start}_{End}.csv with sanitized outlet name"
    requirement: "REPT-03"
    verification:
      - kind: manual_procedural
        ref: "grep -n 'Laporan_' + replace(/[^a-zA-Z0-9]/g, '_') + 'Outlet' fallback in frontend/src/lib/csvGenerator.ts"
        status: pass
    human_judgment: true
    rationale: "link.download filename behavior and sanitization correctness against arbitrary outlet names (spaces, punctuation, non-Latin) require a live browser download to confirm; the regex is verifiable by inspection but its end-to-end effect on the saved file name is browser-driven."
  - id: D3
    description: "ExportButtons CSV button enabled when report data is present and triggers generateReportCSV(data) on click; ObjectURL revoked after download"
    requirement: "REPT-03"
    verification:
      - kind: integration
        ref: "cd frontend && npm run build (tsc -b && vite build) exits 0"
        status: pass
      - kind: manual_procedural
        ref: "grep -c 'generateReportCSV' frontend/src/components/report/ExportButtons.tsx -> 3 (import + onClick + none else); csvDisabled = !data; URL.revokeObjectURL(url) present in csvGenerator.ts"
        status: pass
    human_judgment: true
    rationale: "Enabled/disabled state and revocation are verifiable by code inspection, but the actual CSV download behavior on click (file appears in browser's download bar with correct name and Excel opens it cleanly) requires a live browser UAT."

# Metrics
duration: 1 min
completed: 2026-06-26
status: complete
---

# Phase 3 Plan 04: CSV Export Engine Summary

**Client-side CSV export via a custom ~30-LOC generator producing a UTF-8 BOM prefixed, semicolon-delimited, Excel-compatible (CRLF) CSV with formula-injection tab-prefix guarding and a wired, data-gated ExportButtons CSV trigger**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-06-26T09:24:03Z
- **Completed:** 2026-06-26T09:25:03Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- Added `frontend/src/lib/csvGenerator.ts` exporting `generateReportCSV(data: ReportData): void` — builds a CSV with headers `Tanggal;Omset (Rp);Menu Terlaris;Hari Tercatat` and one row per day (`date;formatRupiah(revenue);topMenu;dayCount`), joined with Windows CRLF (`\r\n`) for Excel compatibility, prefixed with the UTF-8 BOM (`\uFEFF`) so Excel detects UTF-8 encoding (Indonesian diacritics render correctly)
- Implemented `escapeCell(value)` with two hardening layers: (1) **formula-injection mitigation** — cells starting with `=`, `+`, `-`, or `@` are prefixed with a tab character (`\t`) to neutralize Excel formula execution (T-03-12, RESEARCH.md Security Domain); (2) **RFC 4180 quoting** — values containing `;`, `"`, or `\n` are wrapped in double quotes with internal `"` doubled. The tab prefix runs BEFORE quoting so the leading-char test sees the original character
- Triggered browser download via a synthetic `<a>` element + `URL.createObjectURL(blob)`, with `URL.revokeObjectURL(url)` called immediately after `link.click()` to prevent memory leaks (T-03-14 mitigate / RESEARCH.md Pitfall 4)
- Sanitized D-29 filename: `Laporan_{Outlet}_{Start}_{End}.csv` with outlet name regex-replaced to alphanumerics + underscores (T-03-11 mitigate), falling back to literal `Outlet` if empty
- Wired CSV export into `ExportButtons` — the CSV button now imports `generateReportCSV` and calls it on click when data is present; `csvDisabled` flipped from the Plan 03-03 placeholder `true` to `!data`, matching the PDF button's gating pattern. Both PDF and CSV buttons are now active when report data is present (REPT-03)
- No external CSV library added — per RESEARCH.md recommendation, the custom generator is ~30 LOC and avoids a supply-chain dependency
- Generation is entirely client-side (D-36): the CSV is built in-browser from the already-fetched `ReportData` and downloaded via a Blob + ObjectURL; no server round-trip, no server storage (T-03-13 accept)
- `npm run build` exits 0; all 32 frontend tests still pass (no regressions — the ExportButtons change only added an import + onClick handler and flipped a boolean)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create csvGenerator.ts with UTF-8 BOM, semicolon delimiter, and formula injection protection** - `6d1bc47` (feat)
2. **Task 2: Wire CSV export into ExportButtons** - `65a0325` (feat)

**Plan metadata:** (committed in final `docs(03-04)` commit below)

## Files Created/Modified
- `frontend/src/lib/csvGenerator.ts` - **created** — `generateReportCSV(ReportData)` building the Excel-compatible CSV (BOM + `;` + CRLF) and triggering browser download; `escapeCell` with formula-injection tab-prefix + RFC 4180 quoting; sanitized filename; ObjectURL revocation
- `frontend/src/components/report/ExportButtons.tsx` - **modified** — imports `generateReportCSV`, calls it on CSV button click, flips `csvDisabled` from hardcoded `true` to `!data`; updated header comment to reflect both engines wired

## Decisions Made
- **No external CSV library** — a custom generator of ~30 LOC is sufficient and avoids a supply-chain dependency (RESEARCH.md recommendation). Plain string concatenation with semicolon join + CRLF is the entire engine; no need for papaparse or similar.
- **Formula-injection tab prefix applied BEFORE RFC 4180 quoting** so the leading-character test sees the original first character. If a value starts with `=`, `+`, `-`, or `@` it becomes `\t=...` and is then quoted only if it also contains `;`, `"`, or newline. The tab is invisible in Excel but neutralizes the formula trigger (T-03-12).
- **Filename sanitization regex `/[^a-zA-Z0-9]/g` → `'_'`** (single-char class, no `+` quantifier) with literal `'Outlet'` fallback — used the plan's literal spec. This is slightly different from pdfGenerator's `/[^A-Za-z0-9]+/g` with `^_+|_+$` trim (which collapses runs and trims edges), but both satisfy T-03-11; kept the plan's exact form per "execute exactly as written".
- **CSV button enabled state** flipped from the Plan 03-03 placeholder `csvDisabled = true` to `csvDisabled = !data`, matching the PDF button's gating pattern — both buttons are now active when report data is present (REPT-03). The Plan 03-03 Known Stub (CSV button disabled) is now resolved.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — `csvGenerator.ts` and the `ExportButtons` rewiring compiled and built on first attempt; all 32 frontend tests still pass (`npm test`); `npm run build` exits 0 with only the informational chunk-size warning inherited from Plan 03-03 (the jsPDF bundle pushes the main chunk past 500 kB — expected for a PDF+CSV-generating client, noted not fixed).

## User Setup Required
None - no external service configuration required. The CSV generator is purely client-side (built in-browser from already-fetched ReportData).

## Threat Flags

None new beyond the plan's `<threat_model>`. All registered threats mitigated or accepted per plan:
- **T-03-11 (Tampering, filename, mitigate)** — outlet name sanitized to alphanumerics + underscores before `link.download` in `csvGenerator.ts`.
- **T-03-12 (Tampering, formula injection, mitigate)** — `escapeCell` prefixes cells starting with `=`, `+`, `-`, `@` with a tab character before RFC 4180 quoting.
- **T-03-13 (Information Disclosure, accept)** — CSV content is authenticated API data, no PII beyond outlet name, generated client-side, never stored on server.
- **T-03-14 (DoS, ObjectURL memory leak, mitigate)** — `URL.revokeObjectURL(url)` called immediately after `link.click()` in `csvGenerator.ts`.

No new network endpoints, auth paths, or trust-boundary crossings were introduced by this plan.

## Next Phase Readiness
- CSV export engine is complete and wired — the E-Report page's sticky ExportButtons now has BOTH PDF and CSV buttons functional, each triggering a client-side download when report data is present.
- Plan 03-03's Known Stub (CSV button disabled as a placeholder) is resolved: `csvDisabled` is now `!data` and the onClick handler calls `generateReportCSV(data)`.
- Phase 03-e-report-engine is now plan-complete (all 4 plans have SUMMARYs) — ready for phase verification (`/gsd-verify-work 03`) and the next phase discussion/planning.
- No blockers.

## Self-Check: PASSED
- `frontend/src/lib/csvGenerator.ts` exists: PASSED
- `frontend/src/components/report/ExportButtons.tsx` modified (imports generateReportCSV): PASSED
- commit 6d1bc47 (Task 1) in git log: PASSED
- commit 65a0325 (Task 2) in git log: PASSED
- `cd frontend && npm run build` exits 0: PASSED
- `cd frontend && npm test` (32 tests, 7 files) all pass: PASSED
- `grep -c "generateReportCSV" frontend/src/lib/csvGenerator.ts` returns >= 1: PASSED (1)
- `grep -c "generateReportCSV" frontend/src/components/report/ExportButtons.tsx` returns >= 1: PASSED (3)
- `grep -c "uFEFF" frontend/src/lib/csvGenerator.ts` returns >= 1 (UTF-8 BOM): PASSED (1)
- `grep -c "text/csv" frontend/src/lib/csvGenerator.ts` returns >= 1: PASSED (1)
- CSV button in ExportButtons is not disabled when data is present (`csvDisabled = !data`): PASSED

---
*Phase: 03-e-report-engine*
*Completed: 2026-06-26*
