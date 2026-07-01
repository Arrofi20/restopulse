import { PrismaClient, CateringOrder } from '@prisma/client';
import prisma from '../lib/prisma';

export const CATERING_STATUSES = ['PENDING', 'CONFIRMED', 'DONE'] as const;
export type CateringStatus = (typeof CATERING_STATUSES)[number];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  DONE: 2,
};

export class CateringOrderRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    outlet_id: string;
    client_name: string;
    order_date: Date;
    total_amount: number;
    status: string;
    notes?: string | null;
  }): Promise<CateringOrder> {
    return this.prisma.cateringOrder.create({ data });
  }

  async findByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<CateringOrder[]> {
    return this.prisma.cateringOrder.findMany({
      where: {
        outlet_id,
        order_date: { gte: start, lte: end },
      },
      orderBy: { order_date: 'asc' },
    });
  }

  async findByOutlet(
    outlet_id: string,
    status?: string
  ): Promise<CateringOrder[]> {
    return this.prisma.cateringOrder.findMany({
      where: status ? { outlet_id, status } : { outlet_id },
      orderBy: { order_date: 'desc' },
    });
  }

  async searchByClientName(
    outlet_id: string,
    query: string
  ): Promise<CateringOrder[]> {
    return this.prisma.cateringOrder.findMany({
      where: {
        outlet_id,
        client_name: { contains: query },
      },
      orderBy: { order_date: 'desc' },
    });
  }

  async findById(id: string): Promise<CateringOrder | null> {
    return this.prisma.cateringOrder.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<Pick<CateringOrder, 'client_name' | 'order_date' | 'total_amount' | 'notes'>>
  ): Promise<CateringOrder> {
    return this.prisma.cateringOrder.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string): Promise<CateringOrder> {
    return this.prisma.cateringOrder.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<CateringOrder> {
    return this.prisma.cateringOrder.delete({ where: { id } });
  }

  async deleteByOutlet(outlet_id: string): Promise<{ count: number }> {
    return this.prisma.cateringOrder.deleteMany({ where: { outlet_id } });
  }

  async sumByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const result = await this.prisma.cateringOrder.aggregate({
      where: { outlet_id, order_date: { gte: start, lte: end } },
      _sum: { total_amount: true },
    });
    return result._sum.total_amount ?? 0;
  }

  async countByStatus(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<{ status: string; count: number; total: number }[]> {
    const grouped = await this.prisma.cateringOrder.groupBy({
      by: ['status'],
      where: { outlet_id, order_date: { gte: start, lte: end } },
      _count: { id: true },
      _sum: { total_amount: true },
    });
    return grouped.map((g) => ({
      status: g.status,
      count: g._count.id,
      total: g._sum.total_amount ?? 0,
    }));
  }

  canTransition(currentStatus: string, newStatus: string): boolean {
    const currentOrder = STATUS_ORDER[currentStatus];
    const newOrder = STATUS_ORDER[newStatus];
    if (currentOrder === undefined || newOrder === undefined) return false;
    return newOrder > currentOrder;
  }
}
