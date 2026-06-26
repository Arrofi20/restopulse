import { PrismaClient, SalesTrend } from '@prisma/client';
import prisma from '../lib/prisma';

export class SalesTrendRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async upsert(data: {
    date: Date;
    revenue: number;
    menu_popularity: object;
    outlet_id: string;
  }): Promise<SalesTrend> {
    const startOfDay = new Date(data.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(data.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.prisma.salesTrend.findFirst({
      where: {
        outlet_id: data.outlet_id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      return this.prisma.salesTrend.update({
        where: { id: existing.id },
        data: {
          revenue: data.revenue,
          menu_popularity: JSON.stringify(data.menu_popularity),
        },
      });
    }

    return this.prisma.salesTrend.create({
      data: {
        date: data.date,
        revenue: data.revenue,
        menu_popularity: JSON.stringify(data.menu_popularity),
        outlet_id: data.outlet_id,
      },
    });
  }

  async findByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<SalesTrend[]> {
    return this.prisma.salesTrend.findMany({
      where: {
        outlet_id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async aggregateSummary(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<{ totalRevenue: number; transactionCount: number }> {
    const result = await this.prisma.salesTrend.aggregate({
      where: {
        outlet_id,
        date: { gte: start, lte: end },
      },
      _sum: { revenue: true },
      _count: { id: true },
    });
    return {
      totalRevenue: result._sum.revenue || 0,
      transactionCount: result._count.id || 0,
    };
  }

  async deleteByOutletAndDate(
    outlet_id: string,
    date: Date
  ): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await this.prisma.salesTrend.deleteMany({
      where: {
        outlet_id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }
}
