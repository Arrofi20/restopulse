import { AnalyticsService } from './AnalyticsService';
import { dateRangeSchema } from '../validation/sales.schema';

export class DashboardService {
  private analyticsService: AnalyticsService;

  constructor(analyticsService?: AnalyticsService) {
    this.analyticsService = analyticsService ?? new AnalyticsService();
  }

  async getDashboard(outlet_id: string, start: string, end: string) {
    dateRangeSchema.parse({ start, end });

    return this.analyticsService.getAggregatedData(outlet_id, start, end);
  }
}
