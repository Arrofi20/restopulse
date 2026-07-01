import { formatRupiah } from '../../lib/format';
import type { DashboardSummary } from '../../types/dashboard';
import { CateringStatusBadge } from '../catering/CateringStatusBadge';

interface CateringSummaryCardProps {
  summary: DashboardSummary | undefined;
  loading?: boolean;
}

export function CateringSummaryCard({
  summary,
  loading = false,
}: CateringSummaryCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">&nbsp;</div>
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  if (!summary || summary.catering.totalCount === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">Catering</div>
        <div className="mt-1 text-3xl font-bold text-gray-600">—</div>
        <div className="mt-1 text-xs text-gray-600">
          Belum ada pesanan catering
        </div>
      </div>
    );
  }

  const { catering } = summary;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Catering</div>
        <span className="text-xs text-gray-500">
          {catering.totalCount} pesanan
        </span>
      </div>
      <div className="mt-1 text-3xl font-bold text-amber-400">
        {formatRupiah(catering.totalAmount)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {catering.byStatus.map((s) => (
          <div
            key={s.status}
            className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-2.5 py-1"
          >
            <CateringStatusBadge status={s.status} />
            <span className="text-xs text-gray-400">
              {s.count} ({formatRupiah(s.total)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
