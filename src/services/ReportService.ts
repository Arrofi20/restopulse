import { ReportRepository, MonthlyExpenseRepository } from '../repositories';
import { AnalyticsService } from './AnalyticsService';
import { dateRangeSchema } from '../validation/sales.schema';

export class ReportService {
  private reportRepo: ReportRepository;
  private analyticsService: AnalyticsService;
  private expenseRepo: MonthlyExpenseRepository;

  constructor(
    reportRepo?: ReportRepository,
    analyticsService?: AnalyticsService,
    expenseRepo?: MonthlyExpenseRepository
  ) {
    this.reportRepo = reportRepo ?? new ReportRepository();
    this.analyticsService = analyticsService ?? new AnalyticsService();
    this.expenseRepo = expenseRepo ?? new MonthlyExpenseRepository();
  }

  async getReport(outlet_id: string, start: string, end: string) {
    dateRangeSchema.parse({ start, end });

    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    const [analytics, { rows }, expenses] = await Promise.all([
      this.analyticsService.getAggregatedData(outlet_id, start, end),
      this.reportRepo.getReportData(outlet_id, startDate, endDate),
      this.expenseRepo.findByDateRange(outlet_id, startDate, endDate),
    ]);

    const expenseByCategory = this.groupExpensesByCategory(expenses);

    return {
      outlet: analytics.outlet,
      period: { start, end },
      summary: analytics.summary,
      rows,
      expenseByCategory,
    };
  }

  private groupExpensesByCategory(expenses: { category: string; amount: number; month: number; year: number }[]) {
    const grouped: Record<string, number> = {};
    for (const e of expenses) {
      grouped[e.category] = (grouped[e.category] ?? 0) + e.amount;
    }
    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }
}
