import prisma from '../lib/prisma';
import {
  SalesTrendRepository,
  MonthlyExpenseRepository,
  CateringOrderRepository,
} from '../repositories';
import { ProfitLossService } from './ProfitLossService';

export interface AggregatedTrend {
  id: string;
  date: string;
  revenue: number;
  menu_popularity: { items: { name: string; count: number; percentage: number }[] };
  outlet_id: string;
}

export interface CateringSummary {
  totalAmount: number;
  totalCount: number;
  byStatus: { status: string; count: number; total: number }[];
}

export interface AnalyticsSummary {
  totalRevenue: number;
  dayCount: number;
  averageDaily: number;
  totalExpenses: number;
  profitLoss: number;
  isLoss: boolean;
  topMenuItems: { name: string; count: number; percentage: number }[];
  catering: CateringSummary;
}

export interface AnalyticsResult {
  outlet: { name: string };
  period: { start: string; end: string };
  trends: AggregatedTrend[];
  summary: AnalyticsSummary;
}

export class AnalyticsService {
  private salesTrendRepo: SalesTrendRepository;
  private expenseRepo: MonthlyExpenseRepository;
  private cateringRepo: CateringOrderRepository;
  private profitLossService: ProfitLossService;

  constructor(
    salesTrendRepo?: SalesTrendRepository,
    expenseRepo?: MonthlyExpenseRepository,
    cateringRepo?: CateringOrderRepository,
    profitLossService?: ProfitLossService
  ) {
    this.salesTrendRepo = salesTrendRepo ?? new SalesTrendRepository();
    this.expenseRepo = expenseRepo ?? new MonthlyExpenseRepository();
    this.cateringRepo = cateringRepo ?? new CateringOrderRepository();
    this.profitLossService = profitLossService ?? new ProfitLossService(
      this.salesTrendRepo,
      this.expenseRepo
    );
  }

  async getAggregatedData(
    outlet_id: string,
    start: string,
    end: string
  ): Promise<AnalyticsResult> {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    const [trendRows, salesSummary, outlet, cateringByStatus, profitLoss] =
      await Promise.all([
        this.salesTrendRepo.findByDateRange(outlet_id, startDate, endDate),
        this.salesTrendRepo.aggregateSummary(outlet_id, startDate, endDate),
        prisma.outlet.findUnique({
          where: { id: outlet_id },
          select: { name: true },
        }),
        this.cateringRepo.countByStatus(outlet_id, startDate, endDate),
        this.profitLossService.calculateByDateRange(outlet_id, startDate, endDate),
      ]);

    const totalRevenue = salesSummary.totalRevenue;
    const dayCount = salesSummary.dayCount;
    const averageDaily = dayCount > 0 ? totalRevenue / dayCount : 0;

    const cateringTotal = cateringByStatus.reduce(
      (sum, s) => sum + s.total,
      0
    );
    const cateringCount = cateringByStatus.reduce(
      (sum, s) => sum + s.count,
      0
    );

    const topMenuItems = this.aggregateMenuPopularity(trendRows);

    const trends: AggregatedTrend[] = trendRows.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      revenue: r.revenue,
      menu_popularity: JSON.parse(r.menu_popularity),
      outlet_id: r.outlet_id,
    }));

    return {
      outlet: { name: outlet?.name ?? '' },
      period: { start, end },
      trends,
      summary: {
        totalRevenue: profitLoss.totalRevenue,
        dayCount,
        averageDaily: Math.round(averageDaily),
        totalExpenses: profitLoss.totalExpenses,
        profitLoss: profitLoss.profitLoss,
        isLoss: profitLoss.isLoss,
        topMenuItems,
        catering: {
          totalAmount: cateringTotal,
          totalCount: cateringCount,
          byStatus: cateringByStatus,
        },
      },
    };
  }

  private aggregateMenuPopularity(
    trendRows: { menu_popularity: string }[]
  ): { name: string; count: number; percentage: number }[] {
    const counts: Record<string, number> = {};

    for (const row of trendRows) {
      try {
        const parsed = JSON.parse(row.menu_popularity) as {
          items?: { name: string; count: number; percentage: number }[];
        };
        if (parsed.items) {
          for (const item of parsed.items) {
            counts[item.name] = (counts[item.name] ?? 0) + item.count;
          }
        }
      } catch {
        // skip malformed JSON
      }
    }

    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    const items = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return items;
  }
}

export default AnalyticsService;
