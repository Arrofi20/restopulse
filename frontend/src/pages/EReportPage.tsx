import { useState } from 'react';
import { useReport } from '../hooks/useReport';
import { defaultReportDateRange, ReportDateFilter } from '../components/report/ReportDateFilter';
import { ReportSummaryCards } from '../components/report/ReportSummaryCards';
import { ReportDailyTable } from '../components/report/ReportDailyTable';
import { ExportButtons } from '../components/report/ExportButtons';
import { FinancialSummarySection } from '../components/report/FinancialSummarySection';
import { CateringSummarySection } from '../components/report/CateringSummarySection';

export function EReportPage() {
  const [dateRange, setDateRange] = useState(defaultReportDateRange);

  const { data, loading, error } = useReport(dateRange);

  const periodLabel = data
    ? `${data.outlet.name} — ${data.period.start} s/d ${data.period.end}`
    : 'Memuat...';

  const isEmpty = !loading && !!data && data.rows.length === 0;

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-2xl font-bold text-white">E-Report</h1>

      <p className="text-sm text-gray-400">{periodLabel}</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ReportDateFilter value={dateRange} onChange={setDateRange} />
        <ExportButtons data={data} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-300" role="alert">
          {error}
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <div className="text-4xl" aria-hidden="true">📄</div>
          <p className="mt-3 text-sm text-gray-400">
            Tidak ada data untuk periode ini.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Pilih rentang tanggal lain atau jalankan simulasi data terlebih dahulu.
          </p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Ringkasan Penjualan</h2>
            <ReportSummaryCards data={data} loading={loading} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Detail Penjualan Harian</h2>
            <ReportDailyTable rows={data?.rows ?? []} loading={loading} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Ringkasan Keuangan</h2>
            <FinancialSummarySection data={data} loading={loading} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Ringkasan Catering</h2>
            <CateringSummarySection data={data} loading={loading} />
          </section>
        </>
      )}
    </div>
  );
}
