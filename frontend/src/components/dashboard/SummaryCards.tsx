// SummaryCards — total revenue + day count display cards (D-05).
//
// Two cards in a responsive grid (sm:grid-cols-2). Receives props from
// DashboardPage — does NOT fetch data itself.
//
//   Card 1 — "Total Omset":     formatRupiah(totalRevenue), amber-400, 24pt
//   Card 2 — "Hari Tercatat": dayCount, white, 24pt
//
// Loading state: a shimmer (animate-pulse) placeholder so the cards don't
// show "Rp 0" / "0" while the first fetch is in flight (D-12 subtle loading).
//
// OPENCODE.md §5: "Font min 24pt (data finansial)" — text-3xl (~30px) is
// the closest Tailwind size and satisfies the 24pt minimum for financial
// data (the total-omset value).

import { formatRupiah } from '../../lib/format';

interface SummaryCardsProps {
  totalRevenue: number;
  dayCount: number;
  loading?: boolean;
}

export function SummaryCards({
  totalRevenue,
  dayCount,
  loading = false,
}: SummaryCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Total Revenue (D-05) */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Total Omset</div>
        {loading ? (
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-1 text-3xl font-bold text-amber-400">
            {formatRupiah(totalRevenue)}
          </div>
        )}
      </div>

      {/* Transaction Count (D-05) */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Hari Tercatat</div>
        {loading ? (
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-1 text-3xl font-bold text-white">
            {dayCount}
          </div>
        )}
      </div>
    </div>
  );
}
