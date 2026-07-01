import type { DashboardSummary } from './dashboard';

export interface ReportRow {
  date: string;
  revenue: number;
  topMenu: string;
  dayCount: number;
}

export interface ExpenseCategoryTotal {
  category: string;
  total: number;
}

export interface ReportData {
  outlet: { name: string };
  period: { start: string; end: string };
  summary: DashboardSummary;
  rows: ReportRow[];
  expenseByCategory: ExpenseCategoryTotal[];
}

export interface ReportResponse {
  success: boolean;
  data: ReportData;
}

export type { DateRange } from './dashboard';
