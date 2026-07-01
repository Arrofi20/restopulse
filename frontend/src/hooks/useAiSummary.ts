import { useState, useCallback, useRef } from 'react';
import { post } from '../api/client';
import type { DateRange } from '../types/dashboard';

interface AiSummaryResponse {
  success: boolean;
  data: {
    summary: string;
    isMock?: boolean;
    noData?: boolean;
    error?: string;
    message?: string;
  };
}

export function useAiSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const lastDateRangeRef = useRef<DateRange | null>(null);

  const generate = useCallback(async (dateRange: DateRange) => {
    console.log('[AI] generate() called with', dateRange);
    setLoading(true);
    setError(null);
    setSummary(null);
    lastDateRangeRef.current = dateRange;
    try {
      console.log('[AI] Sending POST /ai/summary...');
      const result = await post<AiSummaryResponse>('/ai/summary', {
        start: dateRange.start,
        end: dateRange.end,
      });
      console.log('[AI] Response received:', result.data);
      setSummary(result.data.summary);
      setIsMock(result.data.isMock ?? false);

      if (result.data.noData) {
        setError(result.data.summary);
      }

      if (result.data.error) {
        setError(result.data.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ringkasan AI tidak tersedia saat ini.';
      console.error('[AI] Error:', msg, err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastDateRangeRef.current) {
      generate(lastDateRangeRef.current);
    }
  }, [generate]);

  return { summary, loading, error, isMock, generate, retry };
}
