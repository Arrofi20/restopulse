import { useState } from 'react';
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

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange());

  const { data, loading, error, refresh } = useDashboard(dateRange);
  const {
    summary: aiSummary,
    loading: aiLoading,
    error: aiError,
    isMock,
    generate,
    retry,
  } = useAiSummary();

  const showEmptyState = !loading && !!data && data.trends.length === 0;

  const handleAiSummary = () => {
    console.log('[AI] Button clicked, generating summary for', dateRange);
    try {
      generate(dateRange);
    } catch (e) {
      console.error('[AI] generate threw synchronously:', e);
    }
  };

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
                <span>Membuat ringkasan...</span>
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

      {aiError && (
        <div className="rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-300">
          <div className="flex items-center justify-between">
            <span>{aiError}</span>
            <button
              type="button"
              onClick={retry}
              className="ml-4 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {aiSummary && (
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
    </div>
  );
}
