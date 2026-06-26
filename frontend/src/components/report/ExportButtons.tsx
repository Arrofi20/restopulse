// ExportButtons — sticky export action area for the E-Report page (D-24, D-35).
//
// Renders a sticky container at the top of the report preview containing the
// PDF and CSV export buttons. On mobile the buttons are full-width and stack
// vertically (flex-col); on >=sm they sit at the right (sm:flex-row
// sm:justify-end, sm:w-auto).
//
// The export handlers (`onExportPDF` / `onExportCSV`) are optional. When not
// provided (or when there is no `data` to export), both buttons are disabled.
// This lets plans 03-03 and 03-04 wire their export engines without touching
// this component's core layout — they only need to pass handler callbacks.

import type { ReportData } from '../../types/report';

interface ExportButtonsProps {
  data: ReportData | null;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
}

export function ExportButtons({ data, onExportPDF, onExportCSV }: ExportButtonsProps) {
  const pdfDisabled = !data || !onExportPDF;
  const csvDisabled = !data || !onExportCSV;

  return (
    <div className="sticky top-0 z-10 bg-gray-950/95 py-3 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onExportPDF}
          disabled={pdfDisabled}
          className="w-full rounded bg-amber-400 px-4 py-2 font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={onExportCSV}
          disabled={csvDisabled}
          className="w-full rounded bg-gray-700 px-4 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
