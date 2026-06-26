// usePolling — generic polling hook with Page Visibility API support.
// Source: RESEARCH.md § Pattern 5 (lines 379-418) + PATTERNS.md §9.
//
// Behavior:
//   - Calls `fetchFn()` immediately on mount (initial fetch).
//   - Then calls `fetchFn()` every `intervalMs` via setInterval.
//   - Pauses the interval when the tab becomes hidden (D-13) and resumes
//     with an immediate fetch when visible again.
//   - Cleans up the interval AND the `visibilitychange` listener on unmount
//     (no memory leaks — RESEARCH.md Anti-Pattern: "Polling without cleanup").
//
// The caller MUST wrap `fetchFn` in `useCallback` with stable dependencies so
// its identity doesn't change every render; otherwise this effect re-runs on
// every render and restarts the interval (fetch storm). `useDashboard` does
// this with deps `[dateRange.start, dateRange.end]`.

import { useEffect, useRef } from 'react';

export function usePolling(fetchFn: () => Promise<void>, intervalMs: number): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startPolling = () => {
      fetchFn(); // immediate first fetch
      intervalRef.current = setInterval(fetchFn, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchFn, intervalMs]);
}
