// Tests for PieChart — TDD RED phase.
// Source: 02-05-PLAN.md Task 3 <behavior> tests 1-4.
//
// Chart.js canvas rendering is not supported in jsdom, so react-chartjs-2's
// `Pie` is mocked to a stub canvas. The real business logic — menu
// aggregation (D-02 top-10), multi-field tooltip (D-07) — lives in pure
// exported helpers and is tested directly.
//
// Verifies:
//   Test 1: renders canvas with pie segments when given menu data
//   Test 2: tooltip shows name, percentage, count, and revenue (D-07)
//   Test 3: limits display to top 10 menu items (D-02)
//   Test 4: handles empty/undefined data gracefully (no crash)

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Pie: () => <canvas data-testid="pie-chart" />,
}));

import {
  PieChart,
  aggregateMenuItems,
  formatPieTooltipLines,
  type AggregatedItem,
} from '../dashboard/PieChart';
import type { SalesTrendItem } from '../../types/dashboard';

function makeTrend(date: string, revenue: number, items: { name: string; count: number; percentage: number }[]): SalesTrendItem {
  return {
    id: date,
    date,
    revenue,
    menu_popularity: { items },
    outlet_id: 'outlet-1',
  };
}

describe('PieChart', () => {
  it('Test 1: renders a canvas with pie segments when given menu data', () => {
    render(
      <PieChart
        trends={[makeTrend('2026-06-01', 1_000_000, [
          { name: 'Nasi Durian', count: 10, percentage: 50 },
        ])]}
      />
    );
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('Test 4: handles empty/undefined data gracefully (no crash)', () => {
    const { rerender } = render(<PieChart trends={[]} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    rerender(<PieChart trends={undefined as unknown as SalesTrendItem[]} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});

describe('aggregateMenuItems (D-02 top 10)', () => {
  it('Test 3: aggregates across trends, sorts by count desc, limits to 10', () => {
    const trends = [
      makeTrend('2026-06-01', 1_000_000, [
        { name: 'A', count: 5, percentage: 50 },
        { name: 'B', count: 3, percentage: 30 },
      ]),
      makeTrend('2026-06-02', 800_000, [
        { name: 'A', count: 7, percentage: 60 },
        { name: 'C', count: 2, percentage: 20 },
      ]),
    ];
    const aggregated = aggregateMenuItems(trends);
    // A = 5+7 = 12, B = 3, C = 2 -> sorted desc
    expect(aggregated.map((a) => a.name)).toEqual(['A', 'B', 'C']);
    expect(aggregated[0].count).toBe(12);
    // revenue contributed: A appears in both trends
    // trend1: 50% of 1_000_000 = 500_000; trend2: 60% of 800_000 = 480_000
    expect(aggregated[0].revenue).toBe(980_000);
  });

  it('limits to 10 items even when more exist', () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      name: `Menu${i}`,
      count: 15 - i, // Menu0 highest
      percentage: 1,
    }));
    const trends = [makeTrend('2026-06-01', 100_000, items)];
    const aggregated = aggregateMenuItems(trends);
    expect(aggregated).toHaveLength(10);
    expect(aggregated[0].name).toBe('Menu0');
    expect(aggregated[9].name).toBe('Menu9');
  });

  it('returns empty array for empty trends', () => {
    expect(aggregateMenuItems([])).toEqual([]);
  });
});

describe('PieChart tooltip (D-07)', () => {
  it('Test 2: tooltip shows name, percentage, count, and revenue', () => {
    const item: AggregatedItem = { name: 'Nasi Durian', count: 12, revenue: 980_000 };
    const lines = formatPieTooltipLines(item, 17); // totalCount 17 -> 70.6%
    expect(lines).toEqual([
      'Nasi Durian',
      'Persentase: 70.6%',
      'Jumlah: 12',
      'Omset: Rp 980.000',
    ]);
  });

  it('handles zero totalCount without NaN', () => {
    const item: AggregatedItem = { name: 'X', count: 0, revenue: 0 };
    const lines = formatPieTooltipLines(item, 0);
    expect(lines[1]).toBe('Persentase: 0%');
  });
});
