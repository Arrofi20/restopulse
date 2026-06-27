import {
  DailySalesRepository,
  SalesTrendRepository,
} from '../repositories';

const MENU_ITEMS = [
  'Nasi Goreng',
  'Mie Goreng',
  'Ayam Bakar',
  'Sate Ayam',
  'Gado-Gado',
  'Soto Ayam',
  'Rendang',
  'Cap Cay',
  'Nasi Uduk',
  'Es Teh',
  'Es Jeruk',
  'Kopi',
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

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

export class DummyService {
  private dailySalesRepo: DailySalesRepository;
  private salesTrendRepo: SalesTrendRepository;

  constructor(
    dailySalesRepo: DailySalesRepository,
    salesTrendRepo: SalesTrendRepository
  ) {
    this.dailySalesRepo = dailySalesRepo;
    this.salesTrendRepo = salesTrendRepo;
  }

  generateDayData(date: Date, outlet_id: string) {
    const dayOfWeek = date.getDay();
    const month = date.getMonth();

    let baseRevenue = 800000 + Math.random() * 1200000;

    // Weekend multiplier
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseRevenue *= 1.4 + Math.random() * 0.4;
    }

    // Holiday season multiplier
    if (month === 10 || month === 11) {
      baseRevenue *= 1.1;
    }

    const finalRevenue = Math.round(baseRevenue);

    const menuCount = 2 + Math.floor(Math.random() * 4);
    const selectedMenus: string[] = [];
    for (let i = 0; i < menuCount; i++) {
      selectedMenus.push(
        MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)]
      );
    }

    return {
      date,
      revenue: finalRevenue,
      top_menu_items: selectedMenus,
      outlet_id,
      data_source: 'DUMMY' as const,
    };
  }

  async injectDummyData(outlet_id: string, days: number, confirm: boolean) {
    if (confirm !== true) {
      throw new Error('Confirmation required: set confirm to true to proceed');
    }

    const cappedDays = Math.min(days, 730);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = addDays(today, -cappedDays);

    let inserted = 0;

    for (let i = 0; i <= cappedDays; i++) {
      const currentDate = addDays(startDate, i);
      currentDate.setHours(0, 0, 0, 0);

      const dayData = this.generateDayData(currentDate, outlet_id);

      const existing = await this.dailySalesRepo.findByOutletAndDate(
        outlet_id,
        currentDate
      );

      if (existing) {
        if (existing.data_source === 'DUMMY') {
          await this.dailySalesRepo.update(existing.id, {
            revenue: dayData.revenue,
            top_menu_items: JSON.stringify(dayData.top_menu_items),
          });
          inserted++;
        }
        // If REAL, skip
      } else {
        await this.dailySalesRepo.create({
          date: currentDate,
          revenue: dayData.revenue,
          top_menu_items: dayData.top_menu_items,
          outlet_id,
          data_source: 'DUMMY',
        });
        inserted++;
      }

      await this.salesTrendRepo.upsert({
        date: currentDate,
        revenue: dayData.revenue,
        menu_popularity: computeMenuPopularity(dayData.top_menu_items),
        outlet_id,
      });
    }

    return { inserted };
  }

  async clearDummyData(outlet_id: string) {
    // This method is a safety utility; not exposed via API in v1
    const allSales = await this.dailySalesRepo.findByDateRange(
      outlet_id,
      new Date('2000-01-01'),
      new Date('2100-01-01')
    );

    let deleted = 0;
    for (const sale of allSales) {
      if (sale.data_source === 'DUMMY') {
        await this.dailySalesRepo.delete(sale.id);
        await this.salesTrendRepo.deleteByOutletAndDate(outlet_id, sale.date);
        deleted++;
      }
    }

    return { deleted };
  }
}
