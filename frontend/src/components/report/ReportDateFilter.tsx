// ReportDateFilter — date range selector for the E-Report page (D-19, D-20).
// Copy-adapted from dashboard/DateFilter.tsx with report-specific presets.
//
// Props:
//   - value:    the active DateRange (controlled by EReportPage)
//   - onChange: called with a new DateRange when a preset is clicked or a
//               manual date input changes
//
// Preset buttons (D-19):
//   "Harian"    → today only
//   "Mingguan"  → last 7 days
//   "Bulanan"   → start..end of the current month (D-20 default)
//   "Custom"    → manual picker; selecting it just clears the active preset
//
// The active preset is highlighted (amber-400) by comparing the current
// `value` against each preset's computed range. Custom date inputs sit
// alongside the presets; editing them overrides the preset selection.
//
// Date math uses date-fns (subDays, startOfMonth, endOfMonth, format) per
// the same timezone/DST/leap-year rationale as the dashboard DateFilter.
//
// `defaultReportDateRange()` is exported so EReportPage can initialize its
// state with the SAME date-fns local-date computation the "Bulanan" preset
// uses — this guarantees the Bulanan preset is highlighted as active on
// first paint (mirrors the dashboard's defaultDateRange() fix from 02-04).

import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import type { DateRange } from '../../types/report';

interface ReportDateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { label: string; compute: () => DateRange }[] = [
  {
    label: 'Harian',
    compute: () => ({
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Mingguan',
    compute: () => ({
      start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Bulanan',
    compute: () => ({
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
];

/** D-20 default: current month (Bulanan), computed with the same date-fns
 *  local-date math the "Bulanan" preset uses so the preset is active on
 *  first paint. */
export function defaultReportDateRange(): DateRange {
  return {
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  };
}

function rangesEqual(a: DateRange, b: DateRange): boolean {
  return a.start === b.start && a.end === b.end;
}

export function ReportDateFilter({ value, onChange }: ReportDateFilterProps) {
  // Determine which preset (if any) matches the current value.
  const activePreset = PRESETS.find((p) => rangesEqual(p.compute(), value));

  const handlePresetClick = (compute: () => DateRange) => {
    onChange(compute());
  };

  const handleStartChange = (newStart: string) => {
    // Native date input returns '' when cleared; guard against it.
    if (!newStart) return;
    onChange({ start: newStart, end: value.end });
  };

  const handleEndChange = (newEnd: string) => {
    if (!newEnd) return;
    onChange({ start: value.start, end: newEnd });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons (D-19) */}
      {PRESETS.map((preset) => {
        const isActive = activePreset?.label === preset.label;
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset.compute)}
            className={
              'rounded px-3 py-2.5 text-sm font-medium transition-colors ' +
              (isActive
                ? 'bg-amber-400 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white')
            }
            aria-pressed={isActive}
          >
            {preset.label}
          </button>
        );
      })}

      {/* Custom date picker (manual range; clears the active preset) */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.start}
          onChange={(e) => handleStartChange(e.target.value)}
          aria-label="Tanggal mulai"
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
        />
        <span className="text-gray-500">—</span>
        <input
          type="date"
          value={value.end}
          onChange={(e) => handleEndChange(e.target.value)}
          aria-label="Tanggal akhir"
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
        />
      </div>
    </div>
  );
}
