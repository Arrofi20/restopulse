import { useState } from 'react';
import type { ReportData } from '../../types/report';
import { generateReportPDF } from '../../lib/pdfGenerator';
import { generateReportCSV } from '../../lib/csvGenerator';
import { Spinner } from '../ui/Spinner';

interface ExportButtonsProps {
  data: ReportData | null;
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const handlePdf = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      generateReportPDF(data);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCsv = async () => {
    if (!data) return;
    setCsvLoading(true);
    try {
      generateReportCSV(data);
    } finally {
      setCsvLoading(false);
    }
  };

  const disabled = !data || pdfLoading || csvLoading;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={handlePdf}
        disabled={disabled}
        className="flex items-center justify-center gap-2 w-full rounded bg-amber-400 px-4 py-2.5 font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto min-h-[44px]"
      >
        {pdfLoading ? (
          <>
            <Spinner />
            <span>Export PDF...</span>
          </>
        ) : (
          'Export PDF'
        )}
      </button>
      <button
        type="button"
        onClick={handleCsv}
        disabled={disabled}
        className="flex items-center justify-center gap-2 w-full rounded bg-gray-700 px-4 py-2.5 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto min-h-[44px]"
      >
        {csvLoading ? (
          <>
            <Spinner />
            <span>Export CSV...</span>
          </>
        ) : (
          'Export CSV'
        )}
      </button>
    </div>
  );
}
