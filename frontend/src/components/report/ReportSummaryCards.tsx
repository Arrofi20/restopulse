// ReportSummaryCards — 3 summary cards for the E-Report preview (D-22, D-23).
//
// Cards in a responsive grid (sm:grid-cols-3):
//   1. "Total Omset"       — formatRupiah(summary.totalRevenue), amber-400, 24pt
//   2. "Jumlah Transaksi"  — summary.transactionCount, white, 24pt
//   3. "Menu Terlaris"     — top 3 of summary.topItems joined, white, lg
//
// Loading state: shimmer (animate-pulse) placeholders so the cards don't
// show "Rp 0" / "0" while the first fetch is in flight (D-12 subtle loading).
//
// When `data` is null and not loading, show "-" for all values.
//
// OPENCODE.md §5: "Font min 24pt (data finansial)" — text-3xl (~30px) is
// the closest Tailwind size and satisfies the 24pt minimum for the
// total-omset value (financial data).

import { formatRupiah } from '../../lib/format';
import type { ReportData } from '../../types/report';

interface ReportSummaryCardsProps {
  data: ReportData | null;
  loading: boolean;
}

export function ReportSummaryCards({ data, loading }: ReportSummaryCardsProps) {
  const totalRevenue = data?.summary.totalRevenue;
  const transactionCount = data?.summary.transactionCount;
  const topItems = data?.summary.topItems ?? [];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Omset */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Total Omset</div>
        {loading ? (
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-1 text-3xl font-bold text-amber-400">
            {totalRevenue === undefined ? '-' : formatRupiah(totalRevenue)}
          </div>
        )}
      </div>

      {/* Jumlah Transaksi */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Jumlah Transaksi</div>
        {loading ? (
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-1 text-3xl font-bold text-white">
            {transactionCount === undefined ? '-' : transactionCount}
          </div>
        )}
      </div>

      {/* Menu Terlaris */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Menu Terlaris</div>
        {loading ? (
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-1 text-lg font-medium text-white">
            {topItems.length > 0 ? topItems.slice(0, 3).join(', ') : '-'}
          </div>
        )}
      </div>
    </div>
  );
}
