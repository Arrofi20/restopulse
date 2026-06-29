// Tests for DashboardPage integration — TDD RED phase.
// Source: 02-05-PLAN.md Task 3 <behavior> Test 5.
//
// Verifies:
//   Test 5: DashboardPage renders EmptyState when trends array is empty (D-09)
//
// useDashboard is mocked so the page can be driven with controlled state
// without hitting the API. react-chartjs-2 is mocked to stub canvases so the
// chart components mount in jsdom.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { dashboardState } = vi.hoisted(() => ({
  dashboardState: { current: {} as Record<string, unknown> },
}));

vi.mock('../../hooks/useDashboard', () => ({
  useDashboard: () => dashboardState.current,
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Pie: () => <canvas data-testid="pie-chart" />,
}));

import DashboardPage from '../../pages/DashboardPage';

describe('DashboardPage', () => {
  it('Test 5: renders EmptyState when trends array is empty and not loading (D-09)', () => {
    dashboardState.current = {
      data: {
        outlet: { name: 'Test Outlet' },
        trends: [],
        summary: { totalRevenue: 0, dayCount: 0 },
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    };
    render(<DashboardPage />);
    expect(
      screen.getByText(/Belum ada data penjualan untuk periode ini/i)
    ).toBeInTheDocument();
  });

  it('renders Line + Pie charts when trends exist (not the empty state)', () => {
    dashboardState.current = {
      data: {
        outlet: { name: 'Test Outlet' },
        trends: [
          {
            id: '1',
            date: '2026-06-01',
            revenue: 1_000_000,
            menu_popularity: { items: [{ name: 'A', count: 5, percentage: 50 }] },
            outlet_id: 'o1',
          },
        ],
        summary: { totalRevenue: 1_000_000, dayCount: 5 },
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    };
    render(<DashboardPage />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.queryByText(/Belum ada data/i)).toBeNull();
  });
});
