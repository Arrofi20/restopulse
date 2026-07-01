import { PrismaClient, DailySales } from '@prisma/client';
import prisma from '../lib/prisma';

export class DailySalesRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    date: Date;
    revenue: number;
    top_menu_items: string[];
    outlet_id: string;
    data_source?: string;
  }): Promise<DailySales> {
    return this.prisma.dailySales.create({
      data: {
        ...data,
        top_menu_items: JSON.stringify(data.top_menu_items),
      },
    });
  }

  async findByOutletAndDate(
    outlet_id: string,
    date: Date
  ): Promise<DailySales | null> {
    const startOfDay = new Date(date.getTime());
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date.getTime());
    endOfDay.setUTCHours(23, 59, 59, 999);

    return this.prisma.dailySales.findFirst({
      where: {
        outlet_id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async findByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<DailySales[]> {
    return this.prisma.dailySales.findMany({
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

  async update(
    id: string,
    data: Partial<DailySales>
  ): Promise<DailySales> {
    return this.prisma.dailySales.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<DailySales> {
    return this.prisma.dailySales.delete({
      where: { id },
    });
  }
}
