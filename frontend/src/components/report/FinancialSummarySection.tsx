import { formatRupiah } from '../../lib/format';
import { CATEGORY_LABELS } from '../../types/expense';
import type { ReportData } from '../../types/report';

interface FinancialSummarySectionProps {
  data: ReportData | null;
  loading: boolean;
}

export function FinancialSummarySection({ data, loading }: FinancialSummarySectionProps) {
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Total Pengeluaran</div>
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Laba/Rugi</div>
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, expenseByCategory } = data;
  const profitLossColor = summary.isLoss ? 'text-red-400' : 'text-amber-400';
  const statusLabel = summary.isLoss ? 'Rugi' : summary.profitLoss === 0 ? 'Break Even' : 'Untung';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="text-sm text-gray-400">Total Pengeluaran</div>
          <div className="mt-1 text-3xl font-bold text-orange-400">
            {formatRupiah(summary.totalExpenses)}
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">Laba/Rugi</div>
            <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
              {statusLabel}
            </span>
          </div>
          <div className={`mt-1 text-3xl font-bold ${profitLossColor}`}>
            {formatRupiah(summary.profitLoss)}
          </div>
        </div>
      </div>

      {expenseByCategory && expenseByCategory.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Kategori</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {expenseByCategory.map((e) => (
                <tr key={e.category} className="even:bg-gray-900/50">
                  <td className="px-4 py-3 text-white">
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-orange-400">
                    {formatRupiah(e.total)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-800 font-semibold">
                <td className="px-4 py-3 text-white">Total</td>
                <td className="px-4 py-3 text-right text-orange-400">
                  {formatRupiah(summary.totalExpenses)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <p className="text-sm text-gray-500">Belum ada data pengeluaran untuk periode ini.</p>
        </div>
      )}
    </div>
  );
}
