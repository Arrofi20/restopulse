import { PrismaClient, DailySalesReport } from '@prisma/client';
import prisma from '../lib/prisma';

export class DailyReportRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    period_start: Date;
    period_end: Date;
    total_revenue: number;
    transaction_count: number;
    top_items: object;
    outlet_id: string;
  }): Promise<DailySalesReport> {
    return this.prisma.dailySalesReport.create({
      data: {
        ...data,
        top_items: JSON.stringify(data.top_items),
      },
    });
  }

  async findByPeriod(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<DailySalesReport | null> {
    return this.prisma.dailySalesReport.findFirst({
      where: {
        outlet_id,
        period_start: start,
        period_end: end,
      },
    });
  }
}
