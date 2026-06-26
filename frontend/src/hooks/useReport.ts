// useReport — fetches GET /api/report with a date range and auto-polls.
// Mirrors useDashboard exactly (Plan 03-02 Task 1) but hits /report instead
// of /dashboard. The E-Report page owns its own date state independently of
// the dashboard (D-21 — report date state must NOT bleed into dashboard date
// state and vice versa), so this hook is given the dateRange as a prop just
// like useDashboard; the EReportPage keeps two separate useState instances
// (one per page) so they never share state.
//
// State: { data: ReportData | null, loading: boolean, error: string | null }.
//   - `loading` starts true so the first paint shows the shimmer state.
//   - On fetch success: `data` is set, `error` cleared, `loading` false.
//   - On fetch failure: `error` is set (Indonesian fallback), `loading` false.
//
// Polling: every 30s via `usePolling` (D-10), pausing when the tab is hidden
// (D-13, handled inside usePolling). The fetch is re-triggered whenever the
// date range changes because `fetchReport`'s `useCallback` deps include
// `dateRange.start`/`dateRange.end`.
//
// `refresh()` sets `loading: true` and re-invokes `fetchReport()` for the
// manual refresh button (D-11).
//
// Auth (T-03-05): the existing apiClient attaches the Bearer token and
// handles 401 redirect, so no token is logged here.

import { useState, useCallback } from 'react';
import { get } from '../api/client';
import type { ReportData, DateRange } from '../types/report';
import { usePolling } from './usePolling';

interface ReportResponse {
  success: boolean;
  data: ReportData;
}

export function useReport(dateRange: DateRange) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      const result = await get<ReportResponse>(
        `/report?start=${dateRange.start}&end=${dateRange.end}`
      );
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  // D-10: auto-poll every 30s; D-13: pause when tab hidden (in usePolling).
  usePolling(fetchReport, 30000);

  // D-11: manual refresh — flip loading back on so the UI shows a spinner.
  const refresh = useCallback(() => {
    setLoading(true);
    void fetchReport();
  }, [fetchReport]);

  return { data, loading, error, refresh };
}
