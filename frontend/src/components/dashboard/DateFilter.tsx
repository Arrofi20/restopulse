// DateFilter — date range selector with preset buttons + manual date picker.
// Implements D-01 (default 7 days), D-02 (preset buttons), D-03 (custom picker).
//
// Props:
//   - value:    the active DateRange (controlled by DashboardPage)
//   - onChange: called with a new DateRange when a preset is clicked or a
//               manual date input changes
//
// Preset buttons (D-02):
//   "7 Hari"     → last 7 days (D-01 default)
//   "30 Hari"    → last 30 days
//   "Bulan Ini"  → start..end of the current month
//   "Semua"      → 2020-01-01 .. today (effectively "all time")
//
// The active preset is highlighted (amber-400) by comparing the current
// `value` against each preset's computed range. Custom date inputs (D-03)
// sit alongside the presets; editing them overrides the preset selection.
//
// Date math uses date-fns (subDays, startOfMonth, endOfMonth, format) per
// RESEARCH.md § Don't Hand-Roll (timezone/DST/leap-year edge cases).
//
// `defaultDateRange()` is exported so DashboardPage can initialize its state
// with the SAME date-fns local-date computation the "7 Hari" preset uses —
// this guarantees the preset is highlighted as active on first paint. Using
// `new Date().toISOString()` in DashboardPage instead would compute a UTC
// date that can differ from the preset's local date by a day (timezone bug).

import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import type { DateRange } from '../../types/dashboard';

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { label: string; compute: () => DateRange }[] = [
  {
    label: '7 Hari',
    compute: () => ({
      start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '30 Hari',
    compute: () => ({
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Bulan Ini',
    compute: () => ({
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Semua',
    compute: () => ({
      start: '2020-01-01',
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
];

/** D-01 default: last 7 days, computed with the same date-fns local-date
 *  math the "7 Hari" preset uses so the preset is active on first paint. */
export function defaultDateRange(): DateRange {
  return {
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  };
}

function rangesEqual(a: DateRange, b: DateRange): boolean {
  return a.start === b.start && a.end === b.end;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
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
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {/* Preset buttons (D-02) */}
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

      {/* Custom date picker (D-03) */}
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
