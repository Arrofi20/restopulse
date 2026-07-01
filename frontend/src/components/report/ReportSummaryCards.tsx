import { formatRupiah } from '../../lib/format';
import type { ReportData } from '../../types/report';

interface ReportSummaryCardsProps {
  data: ReportData | null;
  loading: boolean;
}

export function ReportSummaryCards({ data, loading }: ReportSummaryCardsProps) {
  const totalRevenue = data?.summary.totalRevenue;
  const dayCount = data?.summary.dayCount;
  const totalExpenses = data?.summary.totalExpenses;
  const profitLoss = data?.summary.profitLoss;
  const isLoss = data?.summary.isLoss;
  const topItems = data?.summary.topMenuItems?.map((m) => m.name) ?? [];

  const profitLossColor = isLoss ? 'text-red-400' : 'text-amber-400';

  const Card = ({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) => (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="text-sm text-gray-400">{label}</div>
      {loading ? (
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-800" />
      ) : (
        <div className={`mt-1 text-3xl font-bold ${colorClass ?? 'text-white'}`}>
          {value}
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card
        label="Total Omset"
        value={totalRevenue === undefined ? '-' : formatRupiah(totalRevenue)}
        colorClass="text-amber-400"
      />
      <Card
        label="Hari Tercatat"
        value={dayCount === undefined ? '-' : String(dayCount)}
      />
      <Card
        label="Total Pengeluaran"
        value={totalExpenses === undefined ? '-' : formatRupiah(totalExpenses)}
        colorClass="text-orange-400"
      />
      <Card
        label="Laba/Rugi"
        value={profitLoss === undefined ? '-' : formatRupiah(profitLoss)}
        colorClass={profitLossColor}
      />
      <Card
        label="Menu Terlaris"
        value={topItems.length > 0 ? topItems.slice(0, 3).join(', ') : '-'}
      />
    </div>
  );
}
