// Client-side CSV report generator (Plan 03-04).
//
// Produces an Excel-compatible, Indonesian-locale CSV (UTF-8 BOM + semicolon
// delimiter + Windows CRLF line endings) from the supplied ReportData and
// triggers a browser download. Generation runs entirely in the browser
// (D-36) — no server round-trip, no server storage.
//
// No external CSV library is used — a custom generator is ~30 LOC and
// sufficient (RESEARCH.md recommendation). Columns: Tanggal, Omset (Rp),
// Menu Terlaris, Hari Tercatat (D-26). Filename follows D-29:
// `Laporan_{OutletName}_{Start}_{End}.csv` with the outlet name sanitized
// (T-03-11 mitigate).
//
// Threats (see PLAN.md threat_model):
//   T-03-11 (Tampering, filename)        — sanitize outlet name before filename.
//   T-03-12 (Tampering, formula injection) — prefix leading =, +, -, @ with tab.
//   T-03-14 (DoS, ObjectURL memory leak) — always revokeObjectURL after download.

import { formatRupiah } from './format';
import type { ReportData } from '../types/report';

const CSV_HEADERS = ['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Hari Tercatat'];

// Characters that, when they appear at the start of a CSV cell, Excel treats
// as a formula introduction (RESEARCH.md Security Domain). We prefix such
// cells with a tab character so Excel renders them as text instead of
// evaluating a formula (T-03-12 mitigate).
const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@'];

/**
 * Escape a single CSV cell value per RFC 4180 with two hardening extensions:
 *
 * 1. **Formula-injection mitigation (T-03-12):** if the textual value starts
 *    with `=`, `+`, `-`, or `@`, prepend a tab character (`\t`) so Excel does
 *    not interpret the cell as a formula. The tab is invisible when the CSV
 *    is opened in a spreadsheet but neutralizes the formula trigger.
 * 2. **RFC 4180 quoting:** if the value contains the delimiter (`;`), a
 *    double quote (`"`), or a newline (`\n`), wrap it in double quotes and
 *    double any internal double quotes.
 *
 * Otherwise the value is returned as-is (no unnecessary quoting).
 */
function escapeCell(value: unknown): string {
  let str = value == null ? '' : String(value);

  // Formula-injection mitigation — must run BEFORE quoting so the leading
  // character test sees the original first character.
  if (str.length > 0 && FORMULA_INJECTION_PREFIXES.includes(str[0])) {
    str = `\t${str}`;
  }

  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate and download a CSV report from the supplied ReportData.
 *
 * - One row per day, columns: Tanggal, Omset (Rp), Menu Terlaris, Jumlah
 *   Transaksi.
 * - UTF-8 BOM prefix so Excel opens the file with the correct encoding
 *   (Indonesian diacritics and the Rupiah-style figures render correctly).
 * - Semicolon delimiter (Indonesian/Excel-locale convention).
 * - Windows CRLF line endings for Excel compatibility.
 * - Browser download triggered via a synthetic anchor + ObjectURL, with the
 *   ObjectURL revoked immediately after the click (T-03-14 mitigate).
 */
export function generateReportCSV(data: ReportData): void {
  const rows = data.rows.map((r) =>
    [r.date, formatRupiah(r.revenue), r.topMenu, String(r.dayCount)]
      .map(escapeCell)
      .join(';'),
  );

  const csvContent = [CSV_HEADERS.join(';'), ...rows].join('\r\n');

  // UTF-8 BOM so Excel detects UTF-8 encoding (Indonesian diacritics etc.).
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Sanitize outlet name for filename: non-alphanumerics -> '_' (T-03-11).
  // Same pattern as pdfGenerator.ts; falls back to 'Outlet' if empty.
  const safeName = data.outlet.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Outlet';
  link.download = `Laporan_${safeName}_${data.period.start}_${data.period.end}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Always revoke the ObjectURL after the click to prevent memory leaks
  // (T-03-14 mitigate / RESEARCH.md Pitfall 4).
  URL.revokeObjectURL(url);
}
