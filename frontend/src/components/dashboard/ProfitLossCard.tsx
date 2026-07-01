import { formatRupiah } from '../../lib/format';
import type { DashboardSummary } from '../../types/dashboard';

interface ProfitLossCardProps {
  summary: DashboardSummary | undefined;
  loading?: boolean;
}

export function ProfitLossCard({ summary, loading = false }: ProfitLossCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">&nbsp;</div>
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Laba/Rugi</div>
        <div className="mt-1 text-3xl font-bold text-gray-600">—</div>
        <div className="mt-1 text-xs text-gray-600">Data belum tersedia</div>
      </div>
    );
  }

  const isLoss = summary.profitLoss < 0;
  const isBreakEven = summary.profitLoss === 0;
  const hasRevenue = summary.totalRevenue > 0;
  const hasExpenses = summary.totalExpenses > 0;

  const valueColor = isLoss
    ? 'text-red-400'
    : isBreakEven
    ? 'text-yellow-400'
    : 'text-yellow-400';

  const statusLabel = isLoss
    ? 'Rugi'
    : isBreakEven
    ? 'Break Even'
    : 'Untung';

  const statusBg = isLoss
    ? 'bg-red-900/30 border-red-800'
    : 'bg-gray-900 border-gray-800';

  return (
    <div className={`rounded-xl border ${statusBg} p-5`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Laba/Rugi</div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isLoss
              ? 'bg-red-900/50 text-red-400'
              : 'bg-yellow-900/50 text-yellow-400'
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className={`mt-1 text-3xl font-bold ${valueColor}`}>
        {formatRupiah(summary.profitLoss)}
      </div>
      {hasRevenue || hasExpenses ? (
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Total Omset</span>
            <span className="text-amber-400">{formatRupiah(summary.totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Pengeluaran</span>
            <span className="text-orange-400">{formatRupiah(summary.totalExpenses)}</span>
          </div>
          {!hasExpenses && hasRevenue && (
            <div className="mt-1 text-yellow-500">
              Belum ada data pengeluaran untuk bulan ini.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-600">
          Belum ada data pengeluaran untuk periode ini.
        </div>
      )}
    </div>
  );
}
