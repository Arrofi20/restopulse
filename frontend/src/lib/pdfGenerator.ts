// Client-side PDF report generator (Plan 03-03).
//
// Produces an A4 portrait, print-ready PDF (white paper + dark text per D-25b)
// containing: outlet name header, period line, summary stats, daily detail
// table (autoTable), and a footer with generation date + page number on every
// page. Generation runs entirely in the browser (D-36) — no server round-trip.
//
// Libraries: jsPDF (PDF document) + jspdf-autotable (table layout). Both
// were verified legitimate in RESEARCH.md Package Legitimacy Audit
// (T-03-SC mitigate).
//
// Threat: T-03-08 (Tampering, filename) — outlet name is sanitized before
// being placed in doc.save()'s filename to prevent path-traversal chars.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatRupiah } from './format';
import type { ReportData } from '../types/report';

/**
 * Generate and download a PDF report from the supplied ReportData.
 *
 * Layout (A4 portrait, mm):
 *   y=20  outlet name (18pt, near-black)
 *   y=28  period line (11pt, gray)
 *   y=38  summary stats (10pt): total omset, day count, top-3 menu
 *   y=56  daily detail table (autoTable, grid theme, light-gray header)
 *   footer (every page): "Dibuat pada: <ts> — Halaman X / N"
 *
 * File name follows D-29: `Laporan_{OutletName}_{start}_{end}.pdf` with the
 * outlet name sanitized to alphanumerics + underscores (T-03-08).
 */
export function generateReportPDF(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ---- Header section -----------------------------------------------------
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(data.outlet.name, 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Periode: ${data.period.start} s/d ${data.period.end}`, 14, 28);

  // ---- Summary section ----------------------------------------------------
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  const topMenu = data.summary.topItems.slice(0, 3).join(', ') || '-';
  doc.text(`Total Omset: ${formatRupiah(data.summary.totalRevenue)}`, 14, 38);
  doc.text(`Hari Tercatat: ${String(data.summary.dayCount)}`, 14, 44);
  doc.text(`Menu Terlaris: ${topMenu}`, 14, 50);

  // ---- Daily detail table -------------------------------------------------
  // Footer / page count tracking: didDrawPage fires per page autotable prints
  // on, but the *total* page count isn't known until the table is fully laid
  // out. We track the highest page number seen during layout, then post-stamp
  // the "Halaman X / N" segment on every page in a second pass (canonical
  // autoTable multi-page-footer pattern).
  let maxPageNumber = 1;

  autoTable(doc, {
    startY: 56,
    head: [['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Hari Tercatat']],
    body: data.rows.map((r) => [
      r.date,
      formatRupiah(r.revenue),
      r.topMenu,
      String(r.dayCount),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 20,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: 20, // dark text on white paper (D-25b)
    },
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: 'right', cellWidth: 40 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 35 },
    },
    pageBreak: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid', // RESEARCH.md Pitfall 3: don't split rows across pages
    didDrawPage: (dataArg) => {
      if (dataArg.pageNumber > maxPageNumber) {
        maxPageNumber = dataArg.pageNumber;
      }
    },
  });

  // ---- Footer on every page (post-pagination stamp) -----------------------
  const generatedAt = new Date().toLocaleString('id-ID');
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Dibuat pada: ${generatedAt} — Halaman ${page} / ${totalPages}`,
      14,
      pageHeight - 10,
    );
  }

  // ---- Save with sanitized filename (T-03-08) ----------------------------
  const safeName = data.outlet.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Outlet';
  doc.save(`Laporan_${safeName}_${data.period.start}_${data.period.end}.pdf`);
}

// Re-export so consumers/tests can reference the autoTable default if needed.
export { autoTable };