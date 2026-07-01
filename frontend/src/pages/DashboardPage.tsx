import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useAiSummary } from '../hooks/useAiSummary';
import { DateFilter, defaultDateRange } from '../components/dashboard/DateFilter';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ProfitLossCard } from '../components/dashboard/ProfitLossCard';
import { CateringSummaryCard } from '../components/dashboard/CateringSummaryCard';
import { LineChart } from '../components/dashboard/LineChart';
import { PieChart } from '../components/dashboard/PieChart';
import { EmptyState } from '../components/dashboard/EmptyState';
import { RefreshButton } from '../components/ui/RefreshButton';
import { Spinner } from '../components/ui/Spinner';
import type { DateRange } from '../types/dashboard';
import type { AiErrorInfo } from '../hooks/useAiSummary';

function AiErrorDialog({
  error,
  onRetry,
  onDismiss,
}: {
  error: AiErrorInfo;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-md rounded-xl border border-red-800 bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">{error.title}</h2>
        <p className="text-sm text-gray-400">{error.message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 min-h-[44px]"
          >
            Close
          </button>
          {error.kind === 'no_key' && (
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-400 min-h-[44px]"
            >
              Open Settings
            </button>
          )}
          {(error.kind === 'network' || error.kind === 'timeout' || error.kind === 'unknown') && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 min-h-[44px]"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange());

  const { data, loading, error, refresh } = useDashboard(dateRange);
  const {
    summary: aiSummary,
    loading: aiLoading,
    error: aiError,
    isMock,
    showErrorDialog,
    generate,
    retry,
    dismissError,
  } = useAiSummary();

  const showEmptyState = !loading && !!data && data.trends.length === 0;

  const handleAiSummary = useCallback(() => {
    generate(dateRange);
  }, [generate, dateRange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateFilter value={dateRange} onChange={setDateRange} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiSummary}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
          >
            {aiLoading ? (
              <>
                <Spinner />
                <span>Generating AI Business Summary...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                <span>Ringkasan AI</span>
              </>
            )}
          </button>
          <RefreshButton onClick={refresh} loading={loading} />
        </div>
      </div>

      <SummaryCards summary={data?.summary} loading={loading} />

      <ProfitLossCard summary={data?.summary} loading={loading} />

      <CateringSummaryCard summary={data?.summary} loading={loading} />

      {error && (
        <div className="mb-4 rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-300">
          {error}
        </div>
      )}

      {showEmptyState ? (
        <EmptyState onAddData={() => (window.location.href = '/data')} />
      ) : (
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

      {aiSummary && !showErrorDialog && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Ringkasan AI</h3>
            {isMock && (
              <span className="rounded-full bg-yellow-900/50 px-2 py-0.5 text-xs text-yellow-400">
                Mode Demo
              </span>
            )}
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {aiSummary}
          </div>
        </div>
      )}

      {showErrorDialog && aiError && (
        <AiErrorDialog
          error={aiError}
          onRetry={retry}
          onDismiss={dismissError}
        />
      )}
    </div>
  );
}
