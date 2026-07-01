import { PrismaClient, MonthlyExpense } from '@prisma/client';
import prisma from '../lib/prisma';

export class MonthlyExpenseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    outlet_id: string;
    category: string;
    amount: number;
    month: number;
    year: number;
  }): Promise<MonthlyExpense> {
    return this.prisma.monthlyExpense.create({ data });
  }

  async update(
    id: string,
    data: Partial<Pick<MonthlyExpense, 'category' | 'amount' | 'month' | 'year'>>
  ): Promise<MonthlyExpense> {
    return this.prisma.monthlyExpense.update({
      where: { id },
      data,
    });
  }

  async findByOutlet(
    outlet_id: string,
    options?: { limit?: number; offset?: number; orderBy?: 'created_at' | 'amount' | 'year' | 'month'; order?: 'asc' | 'desc' }
  ): Promise<MonthlyExpense[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const orderBy = options?.orderBy ?? 'created_at';
    const order = options?.order ?? 'desc';

    return this.prisma.monthlyExpense.findMany({
      where: { outlet_id },
      orderBy: { [orderBy]: order },
      take: limit,
      skip: offset,
    });
  }

  async countByOutlet(outlet_id: string): Promise<number> {
    return this.prisma.monthlyExpense.count({ where: { outlet_id } });
  }

  async findByOutletAndPeriod(
    outlet_id: string,
    month: number,
    year: number
  ): Promise<MonthlyExpense[]> {
    return this.prisma.monthlyExpense.findMany({
      where: { outlet_id, month, year },
      orderBy: { category: 'asc' },
    });
  }

  async findByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<MonthlyExpense[]> {
    const startYear = start.getUTCFullYear();
    const startMonth = start.getUTCMonth() + 1;
    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth() + 1;

    return this.prisma.monthlyExpense.findMany({
      where: {
        outlet_id,
        OR: [
          { year: { gt: startYear, lt: endYear } },
          {
            AND: [{ year: startYear }, { month: { gte: startMonth } }],
          },
          {
            AND: [{ year: endYear }, { month: { lte: endMonth } }],
          },
        ],
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
  }

  async sumByOutletAndPeriod(
    outlet_id: string,
    month: number,
    year: number
  ): Promise<number> {
    const result = await this.prisma.monthlyExpense.aggregate({
      where: { outlet_id, month, year },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async sumByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const startYear = start.getUTCFullYear();
    const startMonth = start.getUTCMonth() + 1;
    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth() + 1;

    const result = await this.prisma.monthlyExpense.aggregate({
      where: {
        outlet_id,
        OR: [
          { year: { gt: startYear, lt: endYear } },
          {
            AND: [{ year: startYear }, { month: { gte: startMonth } }],
          },
          {
            AND: [{ year: endYear }, { month: { lte: endMonth } }],
          },
        ],
      },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async delete(id: string): Promise<MonthlyExpense> {
    return this.prisma.monthlyExpense.delete({ where: { id } });
  }

  async deleteByOutlet(outlet_id: string): Promise<{ count: number }> {
    return this.prisma.monthlyExpense.deleteMany({ where: { outlet_id } });
  }

  async findById(id: string): Promise<MonthlyExpense | null> {
    return this.prisma.monthlyExpense.findUnique({ where: { id } });
  }

  async hasReportForPeriod(
    outlet_id: string,
    month: number,
    year: number
  ): Promise<boolean> {
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const report = await this.prisma.dailySalesReport.findFirst({
      where: {
        outlet_id,
        period_start: { lte: monthEnd },
        period_end: { gte: monthStart },
      },
      select: { id: true },
    });
    return !!report;
  }
}
