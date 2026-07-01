import { formatRupiah } from './format';
import { CATEGORY_LABELS } from '../types/expense';
import type { ReportData } from '../types/report';

const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@'];

function escapeCell(value: unknown): string {
  let str = value == null ? '' : String(value);
  if (str.length > 0 && FORMULA_INJECTION_PREFIXES.includes(str[0])) {
    str = `\t${str}`;
  }
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateReportCSV(data: ReportData): void {
  const lines: string[] = [];

  // Header
  lines.push(`E-Report: ${data.outlet.name}`);
  lines.push(`Periode: ${data.period.start} s/d ${data.period.end}`);
  lines.push('');

  // Section 1: Sales Summary
  lines.push('--- Ringkasan Penjualan ---');
  lines.push(['Metrik', 'Nilai'].map(escapeCell).join(';'));
  lines.push(['Total Omset', formatRupiah(data.summary.totalRevenue)].map(escapeCell).join(';'));
  lines.push(['Hari Tercatat', String(data.summary.dayCount)].map(escapeCell).join(';'));
  lines.push(['Rata-rata Harian', formatRupiah(data.summary.averageDaily)].map(escapeCell).join(';'));
  lines.push(['Menu Terlaris', data.summary.topMenuItems?.slice(0, 3).map(m => m.name).join(', ') || '-'].map(escapeCell).join(';'));
  lines.push('');

  // Section 2: Daily Sales
  lines.push('--- Detail Penjualan Harian ---');
  lines.push(['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Hari Tercatat'].map(escapeCell).join(';'));
  for (const row of data.rows) {
    lines.push([row.date, formatRupiah(row.revenue), row.topMenu, String(row.dayCount)].map(escapeCell).join(';'));
  }
  lines.push('');

  // Section 3: Financial Summary
  lines.push('--- Ringkasan Keuangan ---');
  lines.push(['Metrik', 'Nilai'].map(escapeCell).join(';'));
  lines.push(['Total Pengeluaran', formatRupiah(data.summary.totalExpenses)].map(escapeCell).join(';'));
  const plLabel = data.summary.isLoss ? 'Rugi' : data.summary.profitLoss === 0 ? 'Break Even' : 'Untung';
  lines.push(['Laba/Rugi', `${formatRupiah(data.summary.profitLoss)} (${plLabel})`].map(escapeCell).join(';'));
  lines.push('');

  if (data.expenseByCategory && data.expenseByCategory.length > 0) {
    lines.push('Pengeluaran per Kategori');
    lines.push(['Kategori', 'Total'].map(escapeCell).join(';'));
    for (const e of data.expenseByCategory) {
      lines.push([CATEGORY_LABELS[e.category] ?? e.category, formatRupiah(e.total)].map(escapeCell).join(';'));
    }
    lines.push('');
  }

  // Section 4: Catering Summary
  lines.push('--- Ringkasan Catering ---');

  if (data.summary.catering && data.summary.catering.totalCount > 0) {
    lines.push(['Metrik', 'Nilai'].map(escapeCell).join(';'));
    lines.push(['Total Revenue Catering', formatRupiah(data.summary.catering.totalAmount)].map(escapeCell).join(';'));
    lines.push(['Jumlah Pesanan', String(data.summary.catering.totalCount)].map(escapeCell).join(';'));
    lines.push('');
    lines.push(['Status', 'Jumlah', 'Total Nilai'].map(escapeCell).join(';'));
    for (const s of data.summary.catering.byStatus) {
      lines.push([s.status, String(s.count), formatRupiah(s.total)].map(escapeCell).join(';'));
    }
    lines.push(['Total', String(data.summary.catering.totalCount), formatRupiah(data.summary.catering.totalAmount)].map(escapeCell).join(';'));
  } else {
    lines.push('(Belum ada pesanan catering)');
  }

  lines.push('');
  lines.push(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`);

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = data.outlet.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Outlet';
  link.download = `Laporan_${safeName}_${data.period.start}_${data.period.end}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
