// DashboardPage — composes the dashboard data layer (D-04 shared filter).
//
// Wires:
//   - dateRange state, initialized to the last 7 days (D-01) via
//     `defaultDateRange()` from DateFilter — uses the same date-fns local-date
//     math as the "7 Hari" preset so the preset is highlighted active on the
//     first paint (avoids a UTC-vs-local timezone mismatch that
//     `new Date().toISOString()` would introduce).
//   - useDashboard(dateRange) → { data, loading, error, refresh } (D-04: the
//     same range drives the fetch and is passed to every child).
//   - DateFilter (D-01/D-02/D-03), SummaryCards (D-05), error banner.
//   - Chart grid (D-16): Line Chart full-width above, Pie Chart below —
//     `grid grid-cols-1 gap-6`. Plan 02-05 replaces the placeholders with
//     real Chart.js components.
//
// Per the plan: no chart components, spinner, or refresh button yet — those
// ship in Plan 02-05. The Header (D-17 outlet name) is rendered by
// DashboardLayout, not here.

import { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DateFilter, defaultDateRange } from '../components/dashboard/DateFilter';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import type { DateRange } from '../types/dashboard';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange());

  // D-04: shared filter — the date range drives the fetch and flows to all
  // children. D-10: auto-poll every 30s (inside useDashboard→usePolling).
  // D-13: polling pauses when the tab is hidden.
  const { data, loading, error, refresh } = useDashboard(dateRange);

  // `refresh` is exposed for Plan 02-05's manual refresh button (D-11).
  // Referenced here so it stays in the component's data contract and isn't
  // tree-shaken from the hook's public surface before 02-05 wires it up.
  void refresh;

  return (
    <div className="space-y-4">
      <DateFilter value={dateRange} onChange={setDateRange} />

      <SummaryCards
        totalRevenue={data?.summary.totalRevenue ?? 0}
        transactionCount={data?.summary.transactionCount ?? 0}
        loading={loading}
      />

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Chart grid (D-16): Line Chart full-width above, Pie Chart below.
          Plan 02-05 replaces these placeholders with real Chart.js charts. */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-4 text-gray-500">
          Line Chart akan tersedia di plan selanjutnya
        </div>
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-4 text-gray-500">
          Pie Chart akan tersedia di plan selanjutnya
        </div>
      </div>
    </div>
  );
}
