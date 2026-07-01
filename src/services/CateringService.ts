import prisma from '../lib/prisma';
import {
  CateringOrderRepository,
  StatusLogRepository,
} from '../repositories';
import {
  createCateringSchema,
  updateCateringSchema,
  CATERING_STATUSES,
} from '../validation/dataManagement.schema';
import type { CateringOrder } from '@prisma/client';

export class CateringService {
  private cateringRepo: CateringOrderRepository;
  private statusLogRepo: StatusLogRepository;

  constructor(
    cateringRepo?: CateringOrderRepository,
    statusLogRepo?: StatusLogRepository
  ) {
    this.cateringRepo = cateringRepo ?? new CateringOrderRepository();
    this.statusLogRepo = statusLogRepo ?? new StatusLogRepository();
  }

  async createCateringOrder(data: {
    client_name: string;
    order_date: string;
    total_amount: number;
    status: string;
    notes?: string | null;
    outlet_id: string;
    actor_id: string;
  }) {
    createCateringSchema.parse(data);

    const orderDate = new Date(data.order_date + 'T00:00:00Z');

    return prisma.$transaction(async (tx) => {
      const created = await tx.cateringOrder.create({
        data: {
          outlet_id: data.outlet_id,
          client_name: data.client_name,
          order_date: orderDate,
          total_amount: data.total_amount,
          status: data.status,
          notes: data.notes ?? null,
        },
      });

      await tx.statusLog.create({
        data: {
          action: 'CREATE',
          entity_type: 'CateringOrder',
          entity_id: created.id,
          new_value: JSON.stringify(created),
          actor_id: data.actor_id,
        },
      });

      return created;
    });
  }

  async getCateringOrders(
    outlet_id: string,
    from?: string,
    to?: string,
    status?: string,
    search?: string
  ): Promise<CateringOrder[]> {
    if (search) {
      const results = await this.cateringRepo.searchByClientName(outlet_id, search);
      return status ? results.filter((o) => o.status === status) : results;
    }

    if (from && to) {
      const startDate = new Date(from + 'T00:00:00Z');
      const endDate = new Date(to + 'T23:59:59.999Z');
      const orders = await this.cateringRepo.findByDateRange(
        outlet_id,
        startDate,
        endDate
      );
      return status ? orders.filter((o) => o.status === status) : orders;
    }

    return this.cateringRepo.findByOutlet(outlet_id, status);
  }

  async updateOrder(
    id: string,
    data: Partial<{
      client_name: string;
      order_date: string;
      total_amount: number;
      status: string;
      notes: string | null;
    }>,
    actor_id: string
  ): Promise<CateringOrder> {
    updateCateringSchema.parse(data);

    const existing = await this.cateringRepo.findById(id);
    if (!existing) {
      throw new Error('Catering order not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.client_name !== undefined) updateData.client_name = data.client_name;
    if (data.order_date !== undefined) {
      updateData.order_date = new Date(data.order_date + 'T00:00:00Z');
    }
    if (data.total_amount !== undefined) updateData.total_amount = data.total_amount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.status !== undefined && data.status !== existing.status) {
      if (!this.cateringRepo.canTransition(existing.status, data.status)) {
        throw new Error(
          `Invalid status transition: ${existing.status} -> ${data.status}. Status can only move forward (PENDING -> CONFIRMED -> DONE).`
        );
      }
      updateData.status = data.status;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.cateringOrder.update({
        where: { id },
        data: updateData,
      });

      await tx.statusLog.create({
        data: {
          action: 'UPDATE',
          entity_type: 'CateringOrder',
          entity_id: id,
          old_value: JSON.stringify(existing),
          new_value: JSON.stringify(updated),
          actor_id,
        },
      });

      return updated;
    });
  }

  async updateStatus(
    id: string,
    newStatus: string,
    actor_id: string
  ): Promise<CateringOrder> {
    const existing = await this.cateringRepo.findById(id);
    if (!existing) {
      throw new Error('Catering order not found');
    }

    if (existing.status === newStatus) {
      return existing;
    }

    if (!this.cateringRepo.canTransition(existing.status, newStatus)) {
      throw new Error(
        `Invalid status transition: ${existing.status} -> ${newStatus}. Status can only move forward (PENDING -> CONFIRMED -> DONE).`
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.cateringOrder.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.statusLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entity_type: 'CateringOrder',
          entity_id: id,
          old_value: JSON.stringify(existing),
          new_value: JSON.stringify(updated),
          actor_id,
        },
      });

      return updated;
    });
  }

  async deleteOrder(id: string, actor_id: string): Promise<CateringOrder> {
    const existing = await this.cateringRepo.findById(id);
    if (!existing) {
      throw new Error('Catering order not found');
    }

    return prisma.$transaction(async (tx) => {
      await tx.statusLog.create({
        data: {
          action: 'DELETE',
          entity_type: 'CateringOrder',
          entity_id: id,
          old_value: JSON.stringify(existing),
          actor_id,
        },
      });

      return tx.cateringOrder.delete({ where: { id } });
    });
  }

  async getOrderById(id: string): Promise<CateringOrder | null> {
    return this.cateringRepo.findById(id);
  }

  getStatuses() {
    return CATERING_STATUSES;
  }
}
