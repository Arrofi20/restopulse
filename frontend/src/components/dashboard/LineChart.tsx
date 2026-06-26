// LineChart — daily revenue trend (DASH-01) with decline detection (D-08),
// Rupiah tooltip (D-06), and a subtle loading overlay (D-12).
//
// Data flow:
//   trends: SalesTrendItem[]  -->  labels (id-ID dates) + revenueData
//   computePointColors(revenueData) -> per-point color array:
//     index 0                       -> accent (amber)
//     revenueData[i] < revenueData[i-1] -> decline (red)   (D-08)
//     otherwise                     -> accent (amber)
//
// Tooltip (D-06): title = the x-axis date label, label = "Rp <revenue>".
// Y-axis ticks use formatCompactRupiah (e.g. "Rp 12,3 jt"). x-axis is a
// `category` scale with pre-formatted date labels (no chartjs-adapter-date-fns
// needed — RESEARCH.md Pitfall 3). Chart.js registration lives in
// chartConfig.ts and runs as a side effect of importing CHART_COLORS.
//
// Empty/null guard: empty trends render an empty dataset so Chart.js does not
// crash (RESEARCH.md Pitfall 4). The loading overlay is a semi-transparent
// layer + Spinner that does NOT replace the chart (D-12).
//
// Source: 02-05-PLAN.md Task 2 + 02-RESEARCH.md Patterns 1-3 + 02-PATTERNS.md §13.

import { Line } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { CHART_COLORS } from '../../lib/chartConfig';
import { formatCompactRupiah } from '../../lib/format';
import { Spinner } from '../ui/Spinner';
import type { SalesTrendItem } from '../../types/dashboard';

/**
 * Per-point color array for decline detection (D-08).
 * - index 0: accent (amber) — no previous day to compare
 * - revenueData[i] < revenueData[i-1]: decline (red)
 * - otherwise: accent (amber)
 */
export function computePointColors(revenueData: number[]): string[] {
  return revenueData.map((value, i) => {
    if (i === 0) return CHART_COLORS.accent;
    return value < revenueData[i - 1] ? CHART_COLORS.decline : CHART_COLORS.accent;
  });
}

/** Tooltip label for the Line Chart (D-06): Rupiah-formatted revenue. */
export function formatLineTooltipLabel(value: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

/** Y-axis tick label: compact Rupiah (e.g. "Rp 12,3 jt"). */
export function formatAxisTick(value: number): string {
  return formatCompactRupiah(value);
}

/** Format an ISO date string as an id-ID date label, e.g. "26 Jun 2026". */
function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface LineChartProps {
  trends: SalesTrendItem[];
  loading?: boolean;
}

export function LineChart({ trends, loading = false }: LineChartProps) {
  const safeTrends = trends ?? [];
  const labels = safeTrends.map((t) => formatDateLabel(t.date));
  const revenueData = safeTrends.map((t) => t.revenue);
  const pointColors = computePointColors(revenueData);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Omset',
        data: revenueData,
        borderColor: CHART_COLORS.accent,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2,
        tension: 0.3, // smooth curve
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.tooltipBg,
        titleColor: CHART_COLORS.primaryText,
        bodyColor: CHART_COLORS.primaryText,
        callbacks: {
          // D-06: title = date from x-axis label
          title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
          // D-06: label = Rupiah-formatted revenue
          label: (context: TooltipItem<'line'>) =>
            formatLineTooltipLabel(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: { color: CHART_COLORS.chartGrid },
        ticks: { color: CHART_COLORS.chartGrid, maxRotation: 45 },
      },
      y: {
        grid: { color: CHART_COLORS.chartGrid },
        ticks: {
          color: CHART_COLORS.chartGrid,
          callback: (value) => formatAxisTick(Number(value)),
        },
      },
    },
  };

  return (
    <div className="relative h-[300px]">
      <Line data={chartData} options={options} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-950/50">
          <Spinner />
        </div>
      )}
    </div>
  );
}
