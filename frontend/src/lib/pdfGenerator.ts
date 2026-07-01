import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from './format';
import { CATEGORY_LABELS } from '../types/expense';
import type { ReportData } from '../types/report';

export function generateReportPDF(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const LABEL = {
    untung: 'Untung',
    rugi: 'Rugi',
    breakEven: 'Break Even',
  };

  let currentY = 20;

  const addSectionTitle = (title: string) => {
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(title, 14, currentY);
    currentY += 8;
  };

  const addText = (text: string, indent = 14, fontSize = 10) => {
    if (currentY > 270) { doc.addPage(); currentY = 20; }
    doc.setFontSize(fontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(text, indent, currentY);
    currentY += 5;
  };

  const addSeparator = () => {
    currentY += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY, 196, currentY);
    currentY += 6;
  };

  // ---- Header ----
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(`E-Report: ${data.outlet.name}`, 14, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Periode: ${data.period.start} s/d ${data.period.end}`, 14, currentY);
  currentY += 10;

  // ---- Section 1: Sales Summary ----
  addSectionTitle('Ringkasan Penjualan');
  addText(`Total Omset: ${formatRupiah(data.summary.totalRevenue)}`);
  addText(`Hari Tercatat: ${data.summary.dayCount}`);
  addText(`Rata-rata Harian: ${formatRupiah(data.summary.averageDaily)}`);
  const topMenu = data.summary.topMenuItems?.slice(0, 3).map(m => m.name).join(', ') || '-';
  addText(`Menu Terlaris: ${topMenu}`);
  addSeparator();

  // ---- Section 2: Daily Sales Table ----
  addSectionTitle('Detail Penjualan Harian');
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    head: [['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Hari Tercatat']],
    body: data.rows.map((r) => [r.date, formatRupiah(r.revenue), r.topMenu, String(r.dayCount)]),
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    bodyStyles: { textColor: 20 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: 'right', cellWidth: 40 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 30 },
    },
    pageBreak: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;
  if (currentY > 240) { doc.addPage(); currentY = 20; }

  // ---- Section 3: Financial Summary ----
  addSectionTitle('Ringkasan Keuangan');
  addText(`Total Pengeluaran: ${formatRupiah(data.summary.totalExpenses)}`);

  const plLabel = data.summary.isLoss ? LABEL.rugi : data.summary.profitLoss === 0 ? LABEL.breakEven : LABEL.untung;
  addText(`Laba/Rugi: ${formatRupiah(data.summary.profitLoss)} (${plLabel})`);

  if (data.expenseByCategory && data.expenseByCategory.length > 0) {
    addText('Pengeluaran per Kategori:');
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      head: [['Kategori', 'Total']],
      body: data.expenseByCategory.map((e) => [
        CATEGORY_LABELS[e.category] ?? e.category,
        formatRupiah(e.total),
      ]),
      foot: [['Total', formatRupiah(data.summary.totalExpenses)]],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
      bodyStyles: { textColor: 20 },
      footStyles: { textColor: 20, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'right', cellWidth: 60 } },
      pageBreak: 'auto',
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
    if (currentY > 240) { doc.addPage(); currentY = 20; }
  } else {
    addText('  (Belum ada data pengeluaran)');
  }
  addSeparator();

  // ---- Section 4: Catering Summary ----
  addSectionTitle('Ringkasan Catering');

  if (data.summary.catering && data.summary.catering.totalCount > 0) {
    addText(`Total Revenue Catering: ${formatRupiah(data.summary.catering.totalAmount)}`);
    addText(`Jumlah Pesanan: ${data.summary.catering.totalCount}`);

    autoTable(doc, {
      startY: currentY,
      head: [['Status', 'Jumlah', 'Total Nilai']],
      body: data.summary.catering.byStatus.map((s) => [
        s.status,
        String(s.count),
        formatRupiah(s.total),
      ]),
      foot: [[
        'Total',
        String(data.summary.catering.totalCount),
        formatRupiah(data.summary.catering.totalAmount),
      ]],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
      bodyStyles: { textColor: 20 },
      footStyles: { textColor: 20, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 60 }, 1: { halign: 'center', cellWidth: 40 }, 2: { halign: 'right', cellWidth: 60 } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  } else {
    addText('  (Belum ada pesanan catering)');
  }

  // ---- Footer ----
  const generatedAt = new Date().toLocaleString('id-ID');
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Dibuat pada: ${generatedAt} — Halaman ${page} / ${totalPages}`,
      14,
      pageHeight - 8,
    );
  }

  const safeName = data.outlet.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Outlet';
  doc.save(`Laporan_${safeName}_${data.period.start}_${data.period.end}.pdf`);
}

export { autoTable };
