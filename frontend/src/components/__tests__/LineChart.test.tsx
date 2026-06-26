// Tests for LineChart — TDD RED phase.
// Source: 02-05-PLAN.md Task 2 <behavior> tests 1-5.
//
// Chart.js canvas rendering is not supported in jsdom, so react-chartjs-2's
// `Line` is mocked to a stub <canvas data-testid="line-chart"/>. The real
// business logic — decline-point color computation (D-08), tooltip Rupiah
// formatting (D-06), and compact axis formatting — lives in pure exported
// helpers and is tested directly.
//
// Verifies:
//   Test 1: LineChart renders a canvas element when given data with trends array
//   Test 2: point colors are red for revenue decline, yellow otherwise (D-08)
//   Test 3: tooltip shows date (title) and Rupiah-formatted revenue (D-06)
//   Test 4: y-axis labels use compact Rupiah format (e.g. "Rp 12,3 jt")
//   Test 5: handles empty/undefined data gracefully (no crash)

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Hoisted mock: react-chartjs-2's `Line` becomes a stub canvas so the
// component mounts in jsdom without a real chart renderer. No canvas context
// is required.
vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
}));

import {
  LineChart,
  computePointColors,
  formatLineTooltipLabel,
  formatAxisTick,
} from '../dashboard/LineChart';
import { CHART_COLORS } from '../../lib/chartConfig';
import type { SalesTrendItem } from '../../types/dashboard';

function makeTrend(date: string, revenue: number): SalesTrendItem {
  return {
    id: date,
    date,
    revenue,
    menu_popularity: { items: [] },
    outlet_id: 'outlet-1',
  };
}

describe('LineChart', () => {
  it('Test 1: renders a canvas element when given data with trends array', () => {
    render(<LineChart trends={[makeTrend('2026-06-01', 1_000_000)]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('Test 5: handles empty/undefined data gracefully (no crash)', () => {
    const { rerender } = render(<LineChart trends={[]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    // undefined trends must not crash either
    rerender(<LineChart trends={undefined as unknown as SalesTrendItem[]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});

describe('computePointColors (D-08 decline detection)', () => {
  it('Test 2: red for decline, amber otherwise', () => {
    // 100 -> 80 (decline) -> 120 (recovery) -> 110 (decline)
    const colors = computePointColors([100, 80, 120, 110]);
    expect(colors).toEqual([
      CHART_COLORS.accent, // first point: amber
      CHART_COLORS.decline, // 80 < 100: red
      CHART_COLORS.accent, // 120 > 80: amber
      CHART_COLORS.decline, // 110 < 120: red
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(computePointColors([])).toEqual([]);
  });
});

describe('LineChart tooltip (D-06)', () => {
  it('Test 3: tooltip label formats revenue as Rupiah', () => {
    expect(formatLineTooltipLabel(1_234_567)).toBe('Rp 1.234.567');
    expect(formatLineTooltipLabel(0)).toBe('Rp 0');
  });
});

describe('LineChart y-axis (compact Rupiah)', () => {
  it('Test 4: axis tick uses compact Rupiah format', () => {
    expect(formatAxisTick(12_000_000)).toBe('Rp 12,0 jt');
    expect(formatAxisTick(1_500_000_000)).toBe('Rp 1,5 M');
    expect(formatAxisTick(500_000)).toBe('Rp 500.000');
  });
});
