import { formatRupiah } from '../../lib/format';
import type { DashboardSummary } from '../../types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary | undefined;
  loading?: boolean;
}

function ShimmerCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="text-sm text-gray-400">&nbsp;</div>
      <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
    </div>
  );
}

export function SummaryCards({ summary, loading = false }: SummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  const profitLossColor = summary.isLoss
    ? 'text-red-400'
    : 'text-green-400';

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Total Omset</div>
          <div className="mt-1 text-3xl font-bold text-amber-400">
            {formatRupiah(summary.totalRevenue)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Hari Tercatat</div>
          <div className="mt-1 text-3xl font-bold text-white">
            {summary.dayCount}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Rata-rata: {formatRupiah(summary.averageDaily)}/hari
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Total Pengeluaran</div>
          <div className="mt-1 text-3xl font-bold text-orange-400">
            {formatRupiah(summary.totalExpenses)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Laba/Rugi</div>
          <div className={`mt-1 text-3xl font-bold ${profitLossColor}`}>
            {formatRupiah(summary.profitLoss)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {summary.isLoss ? 'Rugi' : 'Untung'}
          </div>
        </div>
      </div>

      {summary.catering?.totalCount > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">Ringkasan Catering</div>
            <div className="text-lg font-semibold text-white">
              {formatRupiah(summary.catering?.totalAmount ?? 0)}{' '}
              <span className="text-sm font-normal text-gray-500">
                ({summary.catering?.totalCount ?? 0} pesanan)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.catering?.byStatus?.map((s) => (
              <span
                key={s.status}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  s.status === 'DONE'
                    ? 'bg-green-900/50 text-green-400'
                    : s.status === 'CONFIRMED'
                    ? 'bg-blue-900/50 text-blue-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}
              >
                {s.status}: {s.count} ({formatRupiah(s.total)})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
