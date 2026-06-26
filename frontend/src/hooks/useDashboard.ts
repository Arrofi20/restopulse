// STUB — replaced in GREEN step (TDD RED).
// Real implementation: fetches GET /api/dashboard with date range + auto-polling.
import { useState } from 'react';
import type { DashboardData, DateRange } from '../types/dashboard';

export function useDashboard(_dateRange: DateRange) {
  const [data] = useState<DashboardData | null>(null);
  const [loading] = useState(true);
  const [error] = useState<string | null>(null);
  return {
    data,
    loading,
    error,
    refresh: () => {
      // stub
    },
  };
}
