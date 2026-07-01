export interface MenuPopularityItem {
  name: string;
  count: number;
  percentage: number;
}

export interface SalesTrendItem {
  id: string;
  date: string;
  revenue: number;
  menu_popularity: { items: MenuPopularityItem[] };
  outlet_id: string;
}

export interface CateringStatusSummary {
  status: string;
  count: number;
  total: number;
}

export interface CateringSummary {
  totalAmount: number;
  totalCount: number;
  byStatus: CateringStatusSummary[];
}

export interface DashboardSummary {
  totalRevenue: number;
  dayCount: number;
  averageDaily: number;
  totalExpenses: number;
  profitLoss: number;
  isLoss: boolean;
  topMenuItems: MenuPopularityItem[];
  catering: CateringSummary;
}

export interface DashboardData {
  outlet: { name: string };
  period: { start: string; end: string };
  trends: SalesTrendItem[];
  summary: DashboardSummary;
}

export interface DateRange {
  start: string;
  end: string;
}
