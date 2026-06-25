import { PrismaClient, StatusLog } from '@prisma/client';
import prisma from '../lib/prisma';

export class StatusLogRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    action: string;
    entity_type: string;
    entity_id: string;
    old_value?: object;
    new_value?: object;
    actor_id: string;
  }): Promise<StatusLog> {
    return this.prisma.statusLog.create({
      data: {
        ...data,
        old_value: data.old_value ? JSON.stringify(data.old_value) : null,
        new_value: data.new_value ? JSON.stringify(data.new_value) : null,
      },
    });
  }

  async findByEntity(
    entity_type: string,
    entity_id: string
  ): Promise<StatusLog[]> {
    return this.prisma.statusLog.findMany({
      where: {
        entity_type,
        entity_id,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
