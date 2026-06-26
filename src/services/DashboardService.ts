import { SalesTrendRepository } from '../repositories';
import { dateRangeSchema } from '../validation/sales.schema';
import prisma from '../lib/prisma';

export class DashboardService {
  private salesTrendRepo: SalesTrendRepository;

  constructor(salesTrendRepo: SalesTrendRepository) {
    this.salesTrendRepo = salesTrendRepo;
  }

  async getDashboard(outlet_id: string, start: string, end: string) {
    // 1. Validate date range (reuses existing schema — DASH-01/DASH-02 input validation)
    dateRangeSchema.parse({ start, end });

    // 2. Parse dates with UTC day boundaries (matches SalesService pattern)
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    // 3. Query pre-computed SalesTrend rows (CQRS-lite O(1) reads)
    const rows = await this.salesTrendRepo.findByDateRange(
      outlet_id,
      startDate,
      endDate
    );

    // 4. Aggregate summary statistics over the same range
    const summary = await this.salesTrendRepo.aggregateSummary(
      outlet_id,
      startDate,
      endDate
    );

    // 5. Parse menu_popularity from JSON string to object for each trend row
    const trends = rows.map((r) => ({
      ...r,
      menu_popularity: JSON.parse(r.menu_popularity),
    }));

    // 6. Resolve outlet name for header display (D-17/D-18)
    const outlet = await prisma.outlet.findUnique({
      where: { id: outlet_id },
      select: { name: true },
    });

    return {
      outlet: { name: outlet?.name ?? '' },
      trends,
      summary,
    };
  }
}
