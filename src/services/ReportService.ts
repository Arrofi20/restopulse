import { ReportRepository } from '../repositories';
import { dateRangeSchema } from '../validation/sales.schema';
import prisma from '../lib/prisma';

/**
 * ReportService validates inputs, orchestrates ReportRepository queries,
 * resolves the outlet name, and formats the structured report response.
 *
 * Per D-31 (summary from SalesTrend + detailed breakdown from DailySales)
 * and D-33b (live queries — no caching layer). Reuses the existing
 * dateRangeSchema (DRY, shared with the dashboard + sales verticals).
 */
export class ReportService {
  private reportRepo: ReportRepository;

  constructor(reportRepo: ReportRepository) {
    this.reportRepo = reportRepo;
  }

  async getReport(outlet_id: string, start: string, end: string) {
    // 1. Validate date range (reuses existing schema — format + start<=end)
    dateRangeSchema.parse({ start, end });

    // 2. Parse UTC day boundaries (matches DashboardService pattern)
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    // 3. Query repository for daily rows + period top items
    const { rows, topItems } = await this.reportRepo.getReportData(
      outlet_id,
      startDate,
      endDate
    );

    // 4. Compute period aggregates
    const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
    const dayCount = rows.reduce(
      (sum, r) => sum + r.dayCount,
      0
    );

    // 5. Resolve outlet name for the report header (same pattern as DashboardService)
    const outlet = await prisma.outlet.findUnique({
      where: { id: outlet_id },
      select: { name: true },
    });

    return {
      outlet: { name: outlet?.name ?? '' },
      period: { start, end },
      summary: { totalRevenue, dayCount, topItems },
      rows,
    };
  }
}