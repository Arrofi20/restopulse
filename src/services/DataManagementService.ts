import prisma from '../lib/prisma';
import {
  DailySalesRepository,
  SalesTrendRepository,
  StatusLogRepository,
  MonthlyExpenseRepository,
  CateringOrderRepository,
} from '../repositories';
import { simulateSchema, resetDataSchema } from '../validation/dataManagement.schema';

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

const EXPENSE_CATEGORIES = ['BAHAN_BAKU', 'GAJI', 'OPERASIONAL', 'LAINNYA'];
const CATERING_CLIENTS = [
  'PT Sentosa Jaya',
  'Bu Dewi Catering',
  'Warung Bu Tini',
  'CV Maju Bersama',
  'PT Karya Abadi',
  'Ibu Sari Catering',
  'Restoran Nusantara',
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
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
    percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
  }));
  return { items };
}

interface GeneratedDay {
  date: Date;
  revenue: number;
  top_menu_items: string[];
}

interface GeneratedExpense {
  category: string;
  amount: number;
  month: number;
  year: number;
}

interface GeneratedCatering {
  client_name: string;
  order_date: Date;
  total_amount: number;
  status: string;
  notes: string | null;
}

function generateRealisticRevenue(date: Date): number {
  const dayOfWeek = date.getUTCDay();
  const month = date.getUTCMonth();

  let baseRevenue = 800000 + Math.random() * 1200000;

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseRevenue *= 1.3 + Math.random() * 0.3;
  }

  if (dayOfWeek === 5) {
    baseRevenue *= 1.15;
  }

  if (month === 10 || month === 11) {
    baseRevenue *= 1.1;
  }

  if (month === 0 || month === 2) {
    baseRevenue *= 0.92;
  }

  return Math.round(baseRevenue);
}

function generateMenuSales(): string[] {
  const count = 2 + Math.floor(Math.random() * 4);
  const selected: string[] = [];
  const weights = [15, 14, 12, 11, 8, 8, 7, 6, 6, 5, 5, 3];
  for (let i = 0; i < count; i++) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    for (let j = 0; j < MENU_ITEMS.length; j++) {
      random -= weights[j];
      if (random <= 0) {
        selected.push(MENU_ITEMS[j]);
        break;
      }
    }
  }
  return selected;
}

function generateExpensesForMonth(
  year: number,
  month: number,
  monthlyRevenue: number
): GeneratedExpense[] {
  const expenses: GeneratedExpense[] = [];
  const totalExpenseTarget = monthlyRevenue * (0.3 + Math.random() * 0.2);

  const bahanBaku = Math.round(totalExpenseTarget * (0.4 + Math.random() * 0.1));
  const gaji = Math.round(totalExpenseTarget * (0.25 + Math.random() * 0.05));
  const operasional = Math.round(
    totalExpenseTarget * (0.15 + Math.random() * 0.05)
  );
  const lainnya = Math.round(totalExpenseTarget * (0.05 + Math.random() * 0.05));

  expenses.push({ category: 'BAHAN_BAKU', amount: bahanBaku, month, year });
  expenses.push({ category: 'GAJI', amount: gaji, month, year });
  expenses.push({ category: 'OPERASIONAL', amount: operasional, month, year });
  if (lainnya > 0) {
    expenses.push({ category: 'LAINNYA', amount: lainnya, month, year });
  }

  return expenses;
}

function generateCateringForWeek(
  weekStart: Date
): GeneratedCatering[] {
  const orders: GeneratedCatering[] = [];
  const numOrders = Math.floor(Math.random() * 4);

  for (let i = 0; i < numOrders; i++) {
    const orderDate = addDays(weekStart, Math.floor(Math.random() * 7));
    const amount = Math.round(2000000 + Math.random() * 8000000);
    const client =
      CATERING_CLIENTS[Math.floor(Math.random() * CATERING_CLIENTS.length)];

    const statusRoll = Math.random();
    let status: string;
    if (statusRoll < 0.3) {
      status = 'PENDING';
    } else if (statusRoll < 0.7) {
      status = 'CONFIRMED';
    } else {
      status = 'DONE';
    }

    const notesOptions = [
      null,
      'Pesanan untuk acara kantor',
      'Tambahan nasi putih',
      'Pengantaran jam 11 siang',
      null,
      'Diskon 5% untuk pelanggan tetap',
    ];

    orders.push({
      client_name: client,
      order_date: orderDate,
      total_amount: amount,
      status,
      notes: notesOptions[Math.floor(Math.random() * notesOptions.length)],
    });
  }

  return orders;
}

export class DataManagementService {
  private dailySalesRepo: DailySalesRepository;
  private salesTrendRepo: SalesTrendRepository;
  private statusLogRepo: StatusLogRepository;
  private expenseRepo: MonthlyExpenseRepository;
  private cateringRepo: CateringOrderRepository;

  constructor() {
    this.dailySalesRepo = new DailySalesRepository();
    this.salesTrendRepo = new SalesTrendRepository();
    this.statusLogRepo = new StatusLogRepository();
    this.expenseRepo = new MonthlyExpenseRepository();
    this.cateringRepo = new CateringOrderRepository();
  }

  async checkSimulationExists(outlet_id: string): Promise<boolean> {
    const existing = await prisma.dailySales.findFirst({
      where: { outlet_id, data_source: 'DUMMY' },
      select: { id: true },
    });
    return !!existing;
  }

  async resetData(outlet_id: string, actor_id: string) {
    resetDataSchema.parse({ confirm: true });

    const result = await prisma.$transaction(async (tx) => {
      const salesDeleted = await tx.dailySales.deleteMany({
        where: { outlet_id },
      });
      const trendsDeleted = await tx.salesTrend.deleteMany({
        where: { outlet_id },
      });
      const reportsDeleted = await tx.dailySalesReport.deleteMany({
        where: { outlet_id },
      });
      const expensesDeleted = await tx.monthlyExpense.deleteMany({
        where: { outlet_id },
      });
      const cateringDeleted = await tx.cateringOrder.deleteMany({
        where: { outlet_id },
      });

      await tx.statusLog.create({
        data: {
          action: 'RESET_DATA',
          entity_type: 'OUTLET',
          entity_id: outlet_id,
          new_value: JSON.stringify({
            salesDeleted: salesDeleted.count,
            trendsDeleted: trendsDeleted.count,
            reportsDeleted: reportsDeleted.count,
            expensesDeleted: expensesDeleted.count,
            cateringDeleted: cateringDeleted.count,
          }),
          actor_id,
        },
      });

      return {
        deleted: {
          sales: salesDeleted.count,
          trends: trendsDeleted.count,
          reports: reportsDeleted.count,
          expenses: expensesDeleted.count,
          catering: cateringDeleted.count,
        },
      };
    });

    return result;
  }

  async simulate(
    outlet_id: string,
    actor_id: string,
    days: number,
    startDate?: string,
    confirm: boolean = false
  ) {
    simulateSchema.parse({ days, startDate, confirm });

    const outlet = await prisma.outlet.findUnique({
      where: { id: outlet_id },
      select: { id: true },
    });
    if (!outlet) {
      throw new Error('Outlet tidak ditemukan. Pastikan akun sudah terdaftar dengan benar.');
    }

    const simulationExists = await this.checkSimulationExists(outlet_id);

    if (simulationExists && !confirm) {
      return {
        conflict: true,
        message:
          'Data simulasi sudah ada. Apakah Anda ingin menghapus data lama dan menggantinya dengan data simulasi baru?',
      };
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const simStartDate = startDate
      ? new Date(startDate + 'T00:00:00Z')
      : addDays(today, -days);

    const generatedDays: GeneratedDay[] = [];
    const monthlyRevenue: Record<string, number> = {};
    const generatedCatering: GeneratedCatering[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = addDays(simStartDate, i);
      if (currentDate > today) break;

      const revenue = generateRealisticRevenue(currentDate);
      const menuSales = generateMenuSales();

      generatedDays.push({
        date: currentDate,
        revenue,
        top_menu_items: menuSales,
      });

      const monthKey = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] ?? 0) + revenue;
    }

    const generatedExpenses: GeneratedExpense[] = [];
    for (const [monthKey, revenue] of Object.entries(monthlyRevenue)) {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr) + 1;
      generatedExpenses.push(
        ...generateExpensesForMonth(year, month, revenue)
      );
    }

    for (let week = 0; week < Math.ceil(days / 7); week++) {
      const weekStart = addDays(simStartDate, week * 7);
      if (weekStart > today) break;
      generatedCatering.push(...generateCateringForWeek(weekStart));
    }

    const result = await prisma.$transaction(async (tx) => {
      if (confirm && simulationExists) {
        await tx.dailySales.deleteMany({
          where: { outlet_id, data_source: 'DUMMY' },
        });
        await tx.salesTrend.deleteMany({ where: { outlet_id } });
        await tx.dailySalesReport.deleteMany({ where: { outlet_id } });
        await tx.monthlyExpense.deleteMany({ where: { outlet_id } });
        await tx.cateringOrder.deleteMany({ where: { outlet_id } });
      }

      let insertedSales = 0;
      for (const day of generatedDays) {
        const dayStart = new Date(day.date.getTime());
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(day.date.getTime());
        dayEnd.setUTCHours(23, 59, 59, 999);

        const existing = await tx.dailySales.findFirst({
          where: {
            outlet_id,
            date: { gte: dayStart, lte: dayEnd },
          },
        });

        if (!existing) {
          await tx.dailySales.create({
            data: {
              date: dayStart,
              revenue: day.revenue,
              top_menu_items: JSON.stringify(day.top_menu_items),
              outlet_id,
              data_source: 'DUMMY',
            },
          });
          insertedSales++;
        }
      }

      let insertedExpenses = 0;
      for (const expense of generatedExpenses) {
        const existing = await tx.monthlyExpense.findFirst({
          where: {
            outlet_id,
            category: expense.category,
            month: expense.month,
            year: expense.year,
          },
        });
        if (!existing) {
          await tx.monthlyExpense.create({
            data: {
              outlet_id,
              category: expense.category,
              amount: expense.amount,
              month: expense.month,
              year: expense.year,
            },
          });
          insertedExpenses++;
        }
      }

      let insertedCatering = 0;
      for (const catering of generatedCatering) {
        await tx.cateringOrder.create({
          data: {
            outlet_id,
            client_name: catering.client_name,
            order_date: catering.order_date,
            total_amount: catering.total_amount,
            status: catering.status,
            notes: catering.notes,
          },
        });
        insertedCatering++;
      }

      const trends = await tx.salesTrend.findMany({
        where: { outlet_id },
        orderBy: { date: 'asc' },
      });

      for (const trend of trends) {
        const dayData = generatedDays.find(
          (d) =>
            d.date.toISOString().slice(0, 10) ===
            trend.date.toISOString().slice(0, 10)
        );
        if (dayData) {
          await tx.salesTrend.update({
            where: { id: trend.id },
            data: {
              revenue: dayData.revenue,
              menu_popularity: JSON.stringify(
                computeMenuPopularity(dayData.top_menu_items)
              ),
            },
          });
        }
      }

      for (const day of generatedDays) {
        const trendDayStart = new Date(day.date.getTime());
        trendDayStart.setUTCHours(0, 0, 0, 0);
        const trendDayEnd = new Date(day.date.getTime());
        trendDayEnd.setUTCHours(23, 59, 59, 999);

        const existingTrend = await tx.salesTrend.findFirst({
          where: {
            outlet_id,
            date: {
              gte: trendDayStart,
              lte: trendDayEnd,
            },
          },
        });
        if (!existingTrend) {
          await tx.salesTrend.create({
            data: {
              date: day.date,
              revenue: day.revenue,
              menu_popularity: JSON.stringify(
                computeMenuPopularity(day.top_menu_items)
              ),
              outlet_id,
            },
          });
        }
      }

      await tx.statusLog.create({
        data: {
          action: 'SIMULATE',
          entity_type: 'OUTLET',
          entity_id: outlet_id,
          new_value: JSON.stringify({
            days,
            insertedSales,
            insertedExpenses,
            insertedCatering,
            startDate: simStartDate.toISOString(),
          }),
          actor_id,
        },
      });

      return {
        conflict: false,
        inserted: {
          sales: insertedSales,
          expenses: insertedExpenses,
          catering: insertedCatering,
        },
        daysGenerated: insertedSales,
      };
    });

    return result;
  }
}
