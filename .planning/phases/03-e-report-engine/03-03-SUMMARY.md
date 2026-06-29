---
phase: 03-e-report-engine
plan: 03
subsystem: ui
tags: [react, vite, typescript, pdf, jspdf, jspdf-autotable, report, print, export]

# Dependency graph
requires:
  - phase: 03-e-report-engine
    provides: E-Report preview page (EReportPage), ExportButtons sticky action area with data prop, ReportData shape (outlet/period/summary/rows), useReport hook producing live data
  - phase: 02-dashboard-mvp
    provides: formatRupiah() id-ID currency formatter, apiClient Bearer-token wrapper
provides:
  - Client-side PDF export engine (frontend/src/lib/pdfGenerator.ts) — generateReportPDF(ReportData) producing an A4 portrait, print-ready PDF and triggering a browser download
  - Wired ExportButtons PDF button — enabled when report data is present, calls generateReportPDF on click
  - D-29 filename convention implemented: Laporan_{Outlet}_{Start}_{End}.pdf with sanitized outlet name
affects: [03-04 (CSV export engine — wires its handler into the same ExportButtons), phase verification (PDF success criterion)]

# Tech tracking
tech-stack:
  added: [jspdf@4.2.1, jspdf-autotable@5.0.8]
  patterns:
    - "Client-side PDF generation with jsPDF + jspdf-autotable autoTable functional form (autoTable(doc, options)) — no jsPDFprototype patch"
    - "Multi-page footer with two-pass stamping: didDrawPage tracks max page number during table layout, then a post-autoTable loop stamps 'Halaman X / N' with the now-known total on every doc page (canonical autoTable pattern)"
    - "Filename sanitization via regex replace of non-alphanumerics with underscore before doc.save() — boundary defense at the trust boundary between outlet name and the local file system (T-03-08)"
    - "Print-ready PDF theme: grid table with light-gray header (fillColor 240,240,240) and dark body text (textColor 20) for white-paper readability (D-25b), independent of any dark UI theme"

key-files:
  created:
    - frontend/src/lib/pdfGenerator.ts
  modified:
    - frontend/src/components/report/ExportButtons.tsx
    - frontend/src/pages/EReportPage.tsx
    - frontend/package.json
    - frontend/package-lock.json

key-decisions:
  - "Used the functional autoTable(doc, options) form (imported as default from 'jspdf-autotable') rather than the jsPDF.prototype.autoTable plugin patch — cleaner ESM import, no global mutation, better tree-shaking. Re-exported from pdfGenerator for any consumer needing it."
  - "Post-pagination footer stamping: didDrawPage only accumulates the max page count seen during table layout (the total is not yet knowable there), then a second pass iterates doc.getNumberOfPages() and stamps 'Dibuat pada: <ts> — Halaman X / N' on every page. This is the canonical robust pattern and satisfies the plan's 'footer with page number on every page' requirement."
  - "Dropped the optional onExportPDF/onExportCSV props from ExportButtons per plan instruction — the component now imports generateReportPDF directly and its props simplify to { data: ReportData | null }. CSV stays disabled (csvDisabled = true) as an intentional placeholder for Plan 03-04."
  - "Sanitization regex /[^A-Za-z0-9]+/g -> '_' with leading/trailing underscore trim (T-03-08 mitigate). Falls back to literal 'Outlet' if the sanitization yields an empty string."

patterns-established:
  - "Export engine = a pure function module (pdfGenerator.ts) imported directly by the UI component rather than injected via props — export engines own their own trigger logic, the component just forwards the data"
  - "Print theme is independent of the on-screen dark theme: any future paper-export artifact should follow the same white-paper + dark-text convention (D-25b established here as a reusable rule)"

requirements-completed: [REPT-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Client-side PDF export engine producing an A4 portrait, print-ready PDF (white paper + dark text) with outlet header, period line, summary stats, daily detail table, and per-page footer"
    requirement: "REPT-02"
    verification:
      - kind: integration
        ref: "cd frontend && npm run build (tsc -b && vite build) exits 0"
        status: pass
      - kind: manual_procedural
        ref: "grep -c 'generateReportPDF' frontend/src/lib/pdfGenerator.ts -> 1; grep -c 'autoTable' frontend/src/lib/pdfGenerator.ts -> multiple; layout (header/summary/table/footer) present per spec"
        status: pass
    human_judgment: true
    rationale: "Visual correctness of the generated PDF (A4 layout, font sizes, table column widths, light-gray header readability on white paper, Rupiah formatting, footer placement) requires opening the downloaded file on a live browser — static build + grep confirm the engine compiles and is wired, not that the rendered output looks print-ready."
  - id: D2
    description: "Downloaded file named Laporan_{Outlet}_{Start}_{End}.pdf with sanitized outlet name"
    requirement: "REPT-02"
    verification:
      - kind: manual_procedural
        ref: "grep -n 'Laporan_' + sanitize regex in frontend/src/lib/pdfGenerator.ts; replace(/[^A-Za-z0-9]+/g, '_') and '^_+|_+$' trim present"
        status: pass
    human_judgment: true
    rationale: "doc.save() filename behavior and sanitization correctness against arbitrary outlet names (spaces, punctuation, non-Latin) require a live browser download to confirm; the regex is verifiable by inspection but its end-to-end effect on the saved file name is browser-driven."
  - id: D3
    description: "ExportButtons PDF button enabled when report data is present and triggers generateReportPDF(data) on click"
    requirement: "REPT-02"
    verification:
      - kind: integration
        ref: "cd frontend && npm run build (tsc -b && vite build) exits 0"
        status: pass
      - kind: manual_procedural
        ref: "grep -c 'generateReportPDF' frontend/src/components/report/ExportButtons.tsx -> 3 (import + onClick handler + none else); pdfDisabled = !data"
        status: pass
    human_judgment: true
    rationale: "The enabled/disabled state is verifiable by code inspection but the actual PDF download behavior on click (file appears in browser's download bar with correct name) requires a live browser UAT."

# Metrics
duration: 6 min
completed: 2026-06-26
status: complete
---

# Phase 3 Plan 03: PDF Export Engine Summary

**Client-side PDF export via jsPDF + jspdf-autotable producing an A4 portrait, print-ready (white paper + dark text) report with sanitized filename and a wired, data-gated ExportButtons PDF trigger**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-26T09:11:02Z
- **Completed:** 2026-06-26T09:16:43Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments
- Added `frontend/src/lib/pdfGenerator.ts` exporting `generateReportPDF(data: ReportData): void` — builds an A4 portrait PDF with: outlet name header (18pt near-black, y=20), period line (11pt gray, y=28), summary block (Total Omset / Hari Tercatat / Menu Terlaris top-3, y=38–50), daily detail table via `autoTable(doc, …)` (grid theme, light-gray header fillColor 240/240/240, dark body text, column widths 30/right-40/auto/center-35, `rowPageBreak: 'avoid'`, `showHead: 'everyPage'`), and a per-page footer stamping `Dibuat pada: <id-ID timestamp> — Halaman X / N`
- Sanitized D-29 filename: `Laporan_{Outlet}_{Start}_{End}.pdf` with outlet name regex-replaced to alphanumerics + underscores (T-03-08 mitigate), falling back to `Outlet` if empty
- Wired PDF export into `ExportButtons` — the amber PDF button calls `generateReportPDF(data)` on click when data is present; props simplified from `{ data, onExportPDF?, onExportCSV? }` to `{ data }` per plan instruction; CSV button stays disabled as a documented placeholder for Plan 03-04
- Verified both packages legitimate via RESEARCH.md Package Legitimacy Audit (jspdf 13.6M weekly, jspdf-autotable 3.4M weekly, canonical repos) — both pre-approved in the plan's threat model (T-03-SC mitigate)
- Generation is entirely client-side (D-36): the PDF is built in-browser via jsPDF and downloaded via `doc.save()`; no server round-trip, no server storage (T-03-09 accept)
- `npm run build` exits 0; all 32 frontend tests still pass (no regressions — ExportButtons props simplification did not affect EReportPage's `data`-only usage)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install jspdf + jspdf-autotable and create pdfGenerator.ts** - `a470a67` (feat)
2. **Task 2: Wire PDF export into ExportButtons** - `0fd1abb` (feat)

**Plan metadata:** (committed in final `docs(03-03)` commit below)

## Files Created/Modified
- `frontend/src/lib/pdfGenerator.ts` - **created** — `generateReportPDF(ReportData)` building the A4 print-ready PDF and triggering browser download; two-pass multi-page footer
- `frontend/src/components/report/ExportButtons.tsx` - **modified** — imports `generateReportPDF`, calls it on PDF button click, drops the optional `onExportPDF`/`onExportCSV` props
- `frontend/src/pages/EReportPage.tsx` - **modified** — updated stale comments referencing the old `disabled until handlers wired` state (EReportPage only ever passed `data`, no prop change required)
- `frontend/package.json` - **modified** — added `jspdf@^4.2.1` and `jspdf-autotable@^5.0.8` dependencies
- `frontend/package-lock.json` - **modified** — lockfile updated by `npm install`

## Decisions Made
- **Functional `autoTable(doc, options)` form** instead of `jsPDF.prototype.autoTable` patch — cleaner ESM import from `'jspdf-autotable'`, no global mutation, better tree-shaking. The plugin's default export is the functional form; the prototype form was the older pattern.
- **Two-pass multi-page footer**: `didDrawPage` only records the max page number reached during table layout (the total isn't knowable there because pages are added as the table flows). After `autoTable` returns, a loop over `doc.getNumberOfPages()` re-stamps the full `Dibuat pada: <ts> — Halaman X / N` footer on every page. This is the canonical robust pattern and the literal plan requirement (page number + total on every page) is satisfied.
- **Dropped optional export-handler props** from `ExportButtons` per the plan's explicit "For simplicity, remove the optional props" instruction — the PDF engine is now imported directly; `ExportButtons` props are simply `{ data: ReportData | null }`. CSV remains disabled (`csvDisabled = true`) as a placeholder until Plan 03-04.
- **Filename sanitization regex** `/[^A-Za-z0-9]+/g` → `'_'` with `^_+|_+$` trim (T-03-08 mitigate); falls back to the literal `'Outlet'` if the post-sanitization string is empty. Based on a defensive interpretation of the plan's "remove/replace non-alphanumeric chars with underscore" instruction.
- **Keeping the ExportButtons PDF button amber-400 + black** (print theme lives in the PDF, not in the button itself) — the on-screen UI theme is unchanged; only the exported PDF follows the white-paper + dark-text convention (D-25b).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — both packages installed cleanly; `pdfGenerator.ts` and the `ExportButtons` rewiring compiled and built on first attempt; all 32 frontend tests still pass (`npm test`); `npm run build` exits 0 with only an informational chunk-size warning (the jsPDF bundle pushes the main chunk past 500 kB, which is expected for a PDF-generating client and noted, not fixed).

## User Setup Required
None - no external service configuration required. The PDF generator is purely client-side (jsPDF runs in the browser).

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| CSV export button disabled | `frontend/src/components/report/ExportButtons.tsx` | `csvDisabled = true` | Intentional placeholder — the CSV export engine is the explicit subject of Plan 03-04 and will wire its handler in the same component. The PDF deliverable of this plan (REPT-02) is fully implemented and not stubbed. |

## Threat Flags

None new beyond the plan's `<threat_model>`. All registered threats mitigated or accepted per plan:
- **T-03-08 (Tampering, filename, mitigate)** — outlet name sanitized to alphanumerics + underscores before `doc.save()` in `pdfGenerator.ts`.
- **T-03-09 (Information Disclosure, accept)** — PDF content is authenticated API data, no PII beyond outlet name, generated client-side, never stored on server.
- **T-03-10 (DoS, accept)** — max ~365 rows; jsPDF + autotable handle this well under 2s on modern mobile per RESEARCH.md A4.
- **T-03-SC (Tampering, packages, mitigate)** — jspdf + jspdf-autotable verified legitimate in RESEARCH.md Package Legitimacy Audit; installed cleanly with 0 vulnerabilities.

No new network endpoints, auth paths, or trust-boundary crossings were introduced by this plan.

## Next Phase Readiness
- PDF export engine is complete and wired — the E-Report page's sticky ExportButtons PDF button is now functional and triggers a client-side download when report data is present.
- Ready for Plan 03-04 (CSV export), which will wire its handler into `ExportButtons` in the same pattern (direct import of a `csvGenerator` module; flip `csvDisabled` from `true` to `!data`).
- No blockers.

## Self-Check: PASSED
- `frontend/src/lib/pdfGenerator.ts` exists: PASSED
- `frontend/src/components/report/ExportButtons.tsx` modified (imports generateReportPDF): PASSED
- commit a470a67 (Task 1) in git log: PASSED
- commit 0fd1abb (Task 2) in git log: PASSED
- `cd frontend && npm run build` exits 0: PASSED
- `cd frontend && npm test` (32 tests, 7 files) all pass: PASSED
- `grep -c "jspdf" frontend/package.json` returns >= 1: PASSED (2)
- `grep -c "jspdf-autotable" frontend/package.json` returns >= 1: PASSED (1)
- `grep -c "generateReportPDF" frontend/src/lib/pdfGenerator.ts` returns >= 1: PASSED (1)
- `grep -c "generateReportPDF" frontend/src/components/report/ExportButtons.tsx` returns >= 1: PASSED (3)
- PDF button in ExportButtons is not disabled when `data` is present (`pdfDisabled = !data`): PASSED

---
*Phase: 03-e-report-engine*
*Completed: 2026-06-26*