// EReportPage — full E-Report preview page (Plan 03-02 Task 3).
//
// Replaces the Phase-2 placeholder. Layout (top to bottom):
//   1. Page header ("E-Report")
//   2. Outlet name + period label (or "Memuat..." while loading)
//   3. ReportDateFilter — own date state, independent of dashboard (D-21)
//   4. ExportButtons — sticky, disabled until handlers are wired (03-03/03-04)
//   5. ReportSummaryCards — total omset / transaction count / top menu
//   6. Error banner when fetch fails
//   7. ReportDailyTable — daily breakdown (D-23)
//
// The whole page is wrapped by DashboardLayout via the ProtectedRoute in
// App.tsx, so this component only supplies the page body. Content stacks
// vertically on mobile naturally via the flex-col document flow (D-34).

import { useState } from 'react';
import { useReport } from '../hooks/useReport';
import { defaultReportDateRange, ReportDateFilter } from '../components/report/ReportDateFilter';
import { ReportSummaryCards } from '../components/report/ReportSummaryCards';
import { ReportDailyTable } from '../components/report/ReportDailyTable';
import { ExportButtons } from '../components/report/ExportButtons';

export function EReportPage() {
  // D-21: report date state is owned HERE, fully independent of the
  // dashboard page's date state. Initialized to the Bulanan preset (D-20).
  const [dateRange, setDateRange] = useState(defaultReportDateRange);

  const { data, loading, error } = useReport(dateRange);

  const periodLabel = data
    ? `${data.outlet.name} — ${data.period.start} s/d ${data.period.end}`
    : 'Memuat...';

  return (
    <div className="flex flex-col">
      {/* 1. Page header */}
      <h1 className="mb-4 text-2xl font-bold text-white">E-Report</h1>

      {/* 2. Outlet name + period label */}
      <p className="mb-4 text-sm text-gray-400">{periodLabel}</p>

      {/* 3. Date filter (independent state) */}
      <ReportDateFilter value={dateRange} onChange={setDateRange} />

      {/* 4. Export buttons (sticky; disabled until 03-03/03-04 wire handlers) */}
      <ExportButtons data={data} />

      {/* 5. Summary cards */}
      <ReportSummaryCards data={data} loading={loading} />

      {/* 6. Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-900 px-4 py-3 text-white" role="alert">
          {error}
        </div>
      )}

      {/* 7. Daily breakdown table */}
      <ReportDailyTable rows={data?.rows ?? []} loading={loading} />
    </div>
  );
}
