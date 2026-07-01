import { formatRupiah } from '../../lib/format';
import { CateringStatusBadge } from '../catering/CateringStatusBadge';
import type { ReportData } from '../../types/report';

interface CateringSummarySectionProps {
  data: ReportData | null;
  loading: boolean;
}

export function CateringSummarySection({ data, loading }: CateringSummarySectionProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="text-sm text-gray-400">&nbsp;</div>
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  if (!data) return null;

  const { catering } = data.summary;

  if (!catering || catering.totalCount === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
        <p className="text-sm text-gray-500">Belum ada pesanan catering untuk periode ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Total Revenue Catering</div>
          <div className="mt-1 text-3xl font-bold text-amber-400">
            {formatRupiah(catering.totalAmount)}
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Jumlah Pesanan</div>
          <div className="mt-1 text-3xl font-bold text-white">
            {catering.totalCount}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Jumlah</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Total Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {catering.byStatus.map((s) => (
              <tr key={s.status} className="even:bg-gray-900/50">
                <td className="px-4 py-3">
                  <CateringStatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-center font-medium text-white">
                  {s.count}
                </td>
                <td className="px-4 py-3 text-right font-medium text-amber-400">
                  {formatRupiah(s.total)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-800 font-semibold">
              <td className="px-4 py-3 text-white">Total</td>
              <td className="px-4 py-3 text-center text-white">{catering.totalCount}</td>
              <td className="px-4 py-3 text-right text-amber-400">
                {formatRupiah(catering.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
