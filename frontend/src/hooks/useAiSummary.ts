import { useState, useCallback, useRef } from 'react';
import { post, get } from '../api/client';
import type { DateRange } from '../types/dashboard';
import type { GeminiConfig, GeminiConfigResponse } from '../types/settings';

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

export type AiErrorKind = 'no_key' | 'invalid_key' | 'network' | 'timeout' | 'unknown';

export interface AiErrorInfo {
  kind: AiErrorKind;
  title: string;
  message: string;
}

export function useAiSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AiErrorInfo | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const lastDateRangeRef = useRef<DateRange | null>(null);

  const classifyError = (errorMessage: string): AiErrorInfo => {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('timeout') || msg.includes('melebihi batas waktu')) {
      return {
        kind: 'timeout',
        title: 'Unable to Connect to Gemini',
        message: 'Gemini API took too long to respond. Please check your internet connection or try again later.',
      };
    }
    if (msg.includes('api_key') || msg.includes('permission_denied') || msg.includes('invalid') || msg.includes('expired')) {
      return {
        kind: 'invalid_key',
        title: 'Invalid Gemini API Key',
        message: 'The configured Gemini API key is invalid or has expired. Please update the API key in Settings.',
      };
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect') || msg.includes('unreachable')) {
      return {
        kind: 'network',
        title: 'Unable to Connect to Gemini',
        message: 'Please check your internet connection or try again later.',
      };
    }
    return {
      kind: 'unknown',
      title: 'Unable to Connect to Gemini',
      message: 'Please check your internet connection or try again later.',
    };
  };

  const generate = useCallback(async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setShowErrorDialog(false);
    lastDateRangeRef.current = dateRange;
    try {
      const configRes = await get<GeminiConfigResponse>('/settings/gemini');
      const config: GeminiConfig = configRes.data;

      if (!config.configured) {
        const errInfo: AiErrorInfo = {
          kind: 'no_key',
          title: 'Gemini API Key Not Configured',
          message: 'No Gemini API key has been configured. Please open Settings → Gemini AI and add a valid API key before using AI Summary.',
        };
        setError(errInfo);
        setShowErrorDialog(true);
        return;
      }

      const result = await post<AiSummaryResponse>('/ai/summary', {
        start: dateRange.start,
        end: dateRange.end,
      });

      if (result.data.error) {
        const errInfo = classifyError(result.data.error);
        setError(errInfo);
        setShowErrorDialog(true);
        setIsMock(result.data.isMock ?? false);
        setSummary(result.data.isMock ? result.data.summary : null);
        return;
      }

      if (result.data.noData) {
        setError({
          kind: 'unknown',
          title: 'No Data Available',
          message: result.data.summary,
        });
        setShowErrorDialog(true);
        return;
      }

      setSummary(result.data.summary);
      setIsMock(result.data.isMock ?? false);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const errInfo = classifyError(msg);
      setError(errInfo);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastDateRangeRef.current) {
      generate(lastDateRangeRef.current);
    }
  }, [generate]);

  const dismissError = useCallback(() => {
    setShowErrorDialog(false);
  }, []);

  return { summary, loading, error, isMock, showErrorDialog, generate, retry, dismissError };
}
