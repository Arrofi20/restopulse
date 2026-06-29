// TypeScript contracts for the E-Report API.
// Mirrors the backend GET /api/report response shape
// (ReportController -> ReportService -> ReportRepository aggregating
// SalesTrend revenue + menu_popularity and DailySales per-day presence).

export interface ReportRow {
  date: string; // ISO date string (YYYY-MM-DD)
  revenue: number;
  topMenu: string; // highest-count item name for that day, or "-" if empty
  dayCount: number; // 1 if a DailySales record exists for that date, else 0
}

export interface ReportData {
  outlet: { name: string };
  period: { start: string; end: string };
  summary: {
    totalRevenue: number;
    dayCount: number;
    topItems: string[]; // top 3 menu names by summed count across the range
  };
  rows: ReportRow[];
}

export interface ReportResponse {
  success: boolean;
  data: ReportData;
}

// Re-export DateRange from dashboard for convenience so report consumers
// have a single import path for the shared date-range contract.
export type { DateRange } from './dashboard';
