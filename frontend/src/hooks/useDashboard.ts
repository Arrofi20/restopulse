// useDashboard — fetches GET /api/dashboard with a date range and auto-polls.
// Source: RESEARCH.md § Code Example (lines 632-683) + PATTERNS.md §10.
//
// State: { data: DashboardData | null, loading: boolean, error: string | null }.
//   - `loading` starts true so the first paint shows the shimmer state.
//   - On fetch success: `data` is set, `error` cleared, `loading` false.
//   - On fetch failure: `error` is set (Indonesian fallback), `loading` false.
//
// Polling: every 30s via `usePolling` (D-10), pausing when the tab is hidden
// (D-13, handled inside usePolling). The fetch is re-triggered whenever the
// date range changes because `fetchDashboard`'s `useCallback` deps include
// `dateRange.start`/`dateRange.end` — the new identity restarts usePolling's
// effect (D-04: shared filter for both charts).
//
// `refresh()` sets `loading: true` and re-invokes `fetchDashboard()` for the
// manual refresh button (D-11).
//
// The response shape is `{ success: boolean, data: DashboardData }` matching
// the backend DashboardController (Plan 02-01). The DashboardData already
// carries `outlet.name` — no separate outlet-name fetch is needed.

import { useState, useCallback } from 'react';
import { get } from '../api/client';
import type { DashboardData, DateRange } from '../types/dashboard';
import { usePolling } from './usePolling';

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export function useDashboard(dateRange: DateRange) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await get<DashboardResponse>(
        `/dashboard?start=${dateRange.start}&end=${dateRange.end}`
      );
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  // D-10: auto-poll every 30s; D-13: pause when tab hidden (in usePolling).
  usePolling(fetchDashboard, 30000);

  // D-11: manual refresh — flip loading back on so the UI shows a spinner.
  const refresh = useCallback(() => {
    setLoading(true);
    void fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refresh };
}
