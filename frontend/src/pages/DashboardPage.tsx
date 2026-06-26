// DashboardPage — composes the full interactive dashboard.
//
// Wires:
//   - dateRange state, initialized to the last 7 days (D-01) via
//     `defaultDateRange()` from DateFilter (timezone-safe, matches the
//     "7 Hari" preset so it is highlighted active on first paint).
//   - useDashboard(dateRange) -> { data, loading, error, refresh } (D-04
//     shared filter; D-10 30s auto-poll; D-13 visibility pause).
//   - Top bar: DateFilter (D-01/D-02/D-03) + RefreshButton (D-11 manual
//     refresh; D-12 loading indicator).
//   - SummaryCards (D-05) + error banner.
//   - Empty state (D-09): when data loaded but no trends for the period.
//   - Chart grid (D-16): Line Chart full-width above, Pie Chart below
//     (`grid grid-cols-1 gap-6`). Section headers in Indonesian.
//
// The Header (D-17 outlet name) is rendered by DashboardLayout, not here.
// Plan 02-05 replaces the prior chart placeholders with real Chart.js
// components (LineChart + PieChart) delivering DASH-01/DASH-02/DASH-03.

import { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DateFilter, defaultDateRange } from '../components/dashboard/DateFilter';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { LineChart } from '../components/dashboard/LineChart';
import { PieChart } from '../components/dashboard/PieChart';
import { EmptyState } from '../components/dashboard/EmptyState';
import { RefreshButton } from '../components/ui/RefreshButton';
import type { DateRange } from '../types/dashboard';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange());

  // D-04: shared filter — the date range drives the fetch and flows to all
  // children. D-10: auto-poll every 30s (inside useDashboard -> usePolling).
  // D-13: polling pauses when the tab is hidden.
  const { data, loading, error, refresh } = useDashboard(dateRange);

  // D-09: empty state when data loaded but no trends for this period.
  const showEmptyState =
    !loading && !!data && data.trends.length === 0;

  return (
    <div className="space-y-4">
      {/* Top bar: date filter (left) + manual refresh (right) (D-11) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateFilter value={dateRange} onChange={setDateRange} />
        <RefreshButton onClick={refresh} loading={loading} />
      </div>

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

      {showEmptyState ? (
        // D-09: no data for this period — Indonesian message + CTA.
        // `/data-entry` is a Phase 3 route (manual input form, FR-009);
        // until then the CTA navigates there as a forward reference.
        <EmptyState onAddData={() => (window.location.href = '/data-entry')} />
      ) : (
        /* Chart grid (D-16): Line Chart full-width above, Pie Chart below. */
        <div className="grid grid-cols-1 gap-6">
          <div className="relative rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Tren Omset Harian
            </h3>
            <LineChart trends={data?.trends ?? []} loading={loading} />
          </div>

          <div className="relative rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Menu Terlaris
            </h3>
            <PieChart trends={data?.trends ?? []} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
