// ExportButtons — sticky export action area for the E-Report page (D-24, D-35).
//
// Renders a sticky container at the top of the report preview containing the
// PDF and CSV export buttons. On mobile the buttons are full-width and stack
// vertically (flex-col); on >=sm they sit at the right (sm:flex-row
// sm:justify-end, sm:w-auto).
//
// The PDF export engine (Plan 03-03) is wired in directly here via
// `generateReportPDF(data)` — when report data is present the PDF button is
// enabled and triggers a client-side download (D-36). The CSV button stays
// disabled as a placeholder until Plan 03-04 wires its handler.

import type { ReportData } from '../../types/report';
import { generateReportPDF } from '../../lib/pdfGenerator';

interface ExportButtonsProps {
  data: ReportData | null;
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const pdfDisabled = !data;
  // CSV engine ships in Plan 03-04 — button stays disabled as a placeholder.
  const csvDisabled = true;

  return (
    <div className="sticky top-0 z-10 bg-gray-950/95 py-3 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            if (data) generateReportPDF(data);
          }}
          disabled={pdfDisabled}
          className="w-full rounded bg-amber-400 px-4 py-2 font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Export PDF
        </button>
        <button
          type="button"
          disabled={csvDisabled}
          className="w-full rounded bg-gray-700 px-4 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
