// PieChart — menu popularity (DASH-02) with top-10 aggregation (D-02) and a
// multi-field tooltip (D-07).
//
// Aggregation:
//   Flatten trends[].menu_popularity.items, group by name, sum `count`, and
//   accumulate `revenue` contributed per item = sum of
//   (item.percentage / 100) * trend.revenue for each trend row the item
//   appears in. Sort by count desc, take top 10 (D-02). `totalCount` is the
//   sum of the top-10 counts; each item's tooltip percentage is
//   (count / totalCount) * 100.
//
// Tooltip (D-07): title = item name; label = 4 lines ->
//   [name, "Persentase: x%", "Jumlah: n", "Omset: Rp ..."].
//
// Chart.js registration lives in chartConfig.ts (side effect of importing
// CHART_COLORS). Empty/null guard renders an empty dataset so Chart.js does
// not crash. Loading overlay (D-12) does not replace the chart.
//
// Source: 02-05-PLAN.md Task 3 + 02-RESEARCH.md Pattern 3 + 02-PATTERNS.md §14.

import { Pie } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { CHART_COLORS } from '../../lib/chartConfig';
import { Spinner } from '../ui/Spinner';
import type { SalesTrendItem } from '../../types/dashboard';

export interface AggregatedItem {
  name: string;
  count: number;
  revenue: number;
}

const PIE_PALETTE = [
  '#fbbf24',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#84cc16',
];

/**
 * Aggregate menu popularity across all trend rows into the top-10 items by
 * count (D-02). Revenue contributed per item accumulates
 * (percentage / 100) * trend.revenue for each row the item appears in.
 */
export function aggregateMenuItems(trends: SalesTrendItem[]): AggregatedItem[] {
  const itemMap = new Map<string, { count: number; revenue: number }>();
  for (const trend of trends) {
    const items = trend.menu_popularity?.items ?? [];
    for (const item of items) {
      const existing = itemMap.get(item.name) ?? { count: 0, revenue: 0 };
      existing.count += item.count;
      existing.revenue += (item.percentage / 100) * trend.revenue;
      itemMap.set(item.name, existing);
    }
  }
  return Array.from(itemMap.entries())
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // D-02: top 10 limit
}

/**
 * Pie Chart tooltip lines (D-07): name, percentage, count, Rupiah revenue.
 * Returns the lines used as the tooltip `label` (multi-line).
 */
export function formatPieTooltipLines(
  item: AggregatedItem,
  totalCount: number
): string[] {
  const percentage =
    totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
  return [
    item.name,
    `Persentase: ${percentage}%`,
    `Jumlah: ${item.count}`,
    `Omset: Rp ${new Intl.NumberFormat('id-ID').format(item.revenue)}`,
  ];
}

interface PieChartProps {
  trends: SalesTrendItem[];
  loading?: boolean;
}

export function PieChart({ trends, loading = false }: PieChartProps) {
  const safeTrends = trends ?? [];
  const aggregated = aggregateMenuItems(safeTrends);
  const totalCount = aggregated.reduce((sum, item) => sum + item.count, 0);

  const chartData = {
    labels: aggregated.map((item) => item.name),
    datasets: [
      {
        data: aggregated.map((item) => item.count),
        backgroundColor: PIE_PALETTE,
        borderColor: CHART_COLORS.background,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: CHART_COLORS.primaryText,
          padding: 16,
          font: { size: 13 },
        },
      },
      tooltip: {
        backgroundColor: CHART_COLORS.tooltipBg,
        titleColor: CHART_COLORS.primaryText,
        bodyColor: CHART_COLORS.primaryText,
        callbacks: {
          // D-07: title = item name (from the labels array)
          title: (items: TooltipItem<'pie'>[]) => items[0]?.label ?? '',
          // D-07: multi-line label -> name + percentage + count + revenue
          label: (context: TooltipItem<'pie'>) => {
            const item = aggregated[context.dataIndex];
            if (!item) return '';
            return formatPieTooltipLines(item, totalCount);
          },
        },
      },
    },
  };

  return (
    <div className="relative h-[300px]">
      <Pie data={chartData} options={options} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-950/50">
          <Spinner />
        </div>
      )}
    </div>
  );
}
