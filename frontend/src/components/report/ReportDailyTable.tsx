// ReportDailyTable — daily breakdown table for the E-Report preview (D-23).
//
// Columns: Tanggal | Omset (Rp) | Menu Terlaris | Hari Tercatat
//
// Wrapped in `overflow-x-auto` so the table scrolls horizontally on mobile
// instead of overflowing the viewport.
//
// Loading state: 5 skeleton rows with animate-pulse gray bars.
// Empty state (rows.length === 0 and not loading): single row spanning all
// columns showing "Tidak ada data untuk periode ini".

import { formatRupiah } from '../../lib/format';
import type { ReportRow } from '../../types/report';

interface ReportDailyTableProps {
  rows: ReportRow[];
  loading: boolean;
}

export function ReportDailyTable({ rows, loading }: ReportDailyTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
      <table className="min-w-full divide-y divide-gray-800">
        <thead>
          <tr className="bg-gray-800 text-gray-300">
            <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Omset (Rp)</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Menu Terlaris</th>
            <th className="px-4 py-3 text-center text-sm font-medium">Hari Tercatat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="even:bg-gray-900/50">
                <td className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-4 w-28 animate-pulse rounded bg-gray-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="mx-auto h-4 w-10 animate-pulse rounded bg-gray-700" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                Tidak ada data untuk periode ini
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.date} className="even:bg-gray-900/50">
                <td className="px-4 py-3 text-sm text-white">{row.date}</td>
                <td className="px-4 py-3 text-right text-sm text-white">
                  {formatRupiah(row.revenue)}
                </td>
                <td className="px-4 py-3 text-sm text-white">{row.topMenu}</td>
                <td className="px-4 py-3 text-center text-sm text-white">
                  {row.dayCount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
