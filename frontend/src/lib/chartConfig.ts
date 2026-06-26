// Chart.js tree-shaken registration + dark theme color constants.
// Source: RESEARCH.md § Pattern 1 (lines 239-275) + § Open Questions #3
//         (lines 726-734) + PATTERNS.md §12.
//
// Only the components needed for Line + Pie charts on a `category` x-axis
// are registered. TimeScale / TimeSeriesScale are intentionally NOT imported
// (Phase 2 uses `category` scale with pre-formatted date labels per
// RESEARCH.md Pitfall 3 — no chartjs-adapter-date-fns needed).

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dark theme palette (canvas-rendered — Tailwind classes don't apply to
// chart elements, so colors live as JS constants synced with the theme).
// Matches RESEARCH.md Open Questions #3.
export const CHART_COLORS = {
  background: '#1a1a2e',
  cardBg: '#16213e',
  primaryText: '#ffffff',
  accent: '#fbbf24', // amber-400 — revenue line + positive markers
  decline: '#ef4444', // red-500 — decline point markers + annotations
  chartGrid: 'rgba(255, 255, 255, 0.1)',
  tooltipBg: 'rgba(0, 0, 0, 0.85)',
} as const;
