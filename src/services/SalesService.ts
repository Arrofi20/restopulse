import {
  DailySalesRepository,
  StatusLogRepository,
  SalesTrendRepository,
} from '../repositories';
import { createSalesSchema, dateRangeSchema } from '../validation/sales.schema';

function computeMenuPopularity(menuItems: string[]): {
  items: { name: string; count: number; percentage: number }[];
} {
  const counts: Record<string, number> = {};
  for (const item of menuItems) {
    counts[item] = (counts[item] || 0) + 1;
  }

  const total = menuItems.length;
  const items = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / total) * 10000) / 100,
  }));

  return { items };
}

export class SalesService {
  private dailySalesRepo: DailySalesRepository;
  private statusLogRepo: StatusLogRepository;
  private salesTrendRepo: SalesTrendRepository;

  constructor(
    dailySalesRepo: DailySalesRepository,
    statusLogRepo: StatusLogRepository,
    salesTrendRepo: SalesTrendRepository
  ) {
    this.dailySalesRepo = dailySalesRepo;
    this.statusLogRepo = statusLogRepo;
    this.salesTrendRepo = salesTrendRepo;
  }

  async createSale(data: {
    date: string;
    revenue: number;
    top_menu_items: string[];
    outlet_id: string;
    actor_id: string;
    data_source?: string;
  }) {
    createSalesSchema.parse(data);

    const saleDate = new Date(data.date + 'T00:00:00Z');

    if (saleDate > new Date()) {
      throw new Error('Cannot record sales for future dates');
    }

    const existing = await this.dailySalesRepo.findByOutletAndDate(
      data.outlet_id,
      saleDate
    );
    if (existing) {
      throw new Error('Sales record already exists for this date');
    }

    const createdSale = await this.dailySalesRepo.create({
      date: saleDate,
      revenue: data.revenue,
      top_menu_items: data.top_menu_items,
      outlet_id: data.outlet_id,
      data_source: data.data_source || 'REAL',
    });

    await this.statusLogRepo.create({
      action: 'CREATE',
      entity_type: 'DailySales',
      entity_id: createdSale.id,
      new_value: createdSale,
      actor_id: data.actor_id,
    });

    await this.salesTrendRepo.upsert({
      date: saleDate,
      revenue: data.revenue,
      menu_popularity: computeMenuPopularity(data.top_menu_items),
      outlet_id: data.outlet_id,
    });

    return createdSale;
  }

  async getSalesByRange(outlet_id: string, start: string, end: string) {
    dateRangeSchema.parse({ start, end });

    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    return this.dailySalesRepo.findByDateRange(outlet_id, startDate, endDate);
  }
}
