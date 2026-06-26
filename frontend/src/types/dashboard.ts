// TypeScript contracts for the dashboard API.
// Mirrors the backend GET /api/dashboard response shape
// (DashboardController -> DashboardService -> SalesTrend rows with
// menu_popularity stored as a JSON string, parsed by the service).

export interface MenuPopularityItem {
  name: string;
  count: number;
  percentage: number;
}

export interface SalesTrendItem {
  id: string;
  date: string; // ISO date string from API
  revenue: number;
  menu_popularity: { items: MenuPopularityItem[] }; // parsed from JSON
  outlet_id: string;
}

export interface DashboardData {
  outlet: { name: string };
  trends: SalesTrendItem[];
  summary: {
    totalRevenue: number;
    transactionCount: number;
  };
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}
