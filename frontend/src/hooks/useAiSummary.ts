// useAiSummary — fetches AI-generated summary from POST /api/ai/summary.
//
// State: { summary: string | null, loading: boolean, error: string | null }.
//   - `generate` accepts trends and summary payload and sends to backend.
//   - On success: `summary` is set, `error` cleared, `loading` false.
//   - On failure: `error` is set (Indonesian fallback), `loading` false.

import { useState, useCallback } from 'react';
import { post } from '../api/client';
import type { DashboardData } from '../types/dashboard';

interface AiSummaryResponse {
  success: boolean;
  data: {
    summary: string;
  };
}

export function useAiSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (payload: Pick<DashboardData, 'trends' | 'summary'>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await post<AiSummaryResponse>('/ai/summary', payload);
      setSummary(result.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat ringkasan AI');
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, generate };
}
