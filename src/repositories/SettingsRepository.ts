import { PrismaClient, Setting } from '@prisma/client';
import prisma from '../lib/prisma';

export class SettingsRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async get(outlet_id: string, key: string): Promise<Setting | null> {
    return this.prisma.setting.findUnique({
      where: {
        outlet_id_key: { outlet_id, key },
      },
    });
  }

  async upsert(outlet_id: string, key: string, value: string): Promise<Setting> {
    return this.prisma.setting.upsert({
      where: {
        outlet_id_key: { outlet_id, key },
      },
      create: { outlet_id, key, value },
      update: { value },
    });
  }

  async delete(outlet_id: string, key: string): Promise<void> {
    await this.prisma.setting.deleteMany({
      where: { outlet_id, key },
    });
  }

  async getAll(outlet_id: string): Promise<Setting[]> {
    return this.prisma.setting.findMany({
      where: { outlet_id },
    });
  }
}
