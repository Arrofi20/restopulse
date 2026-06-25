import { PrismaClient, OwnerAccount } from '@prisma/client';
import prisma from '../lib/prisma';

export class OwnerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: {
    username: string;
    password_hash: string;
    outlet_id: string;
  }): Promise<OwnerAccount> {
    return this.prisma.ownerAccount.create({ data });
  }

  async findByUsername(username: string): Promise<OwnerAccount | null> {
    return this.prisma.ownerAccount.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<OwnerAccount | null> {
    return this.prisma.ownerAccount.findUnique({
      where: { id },
    });
  }
}
