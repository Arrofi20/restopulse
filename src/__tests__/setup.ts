import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';

const TEST_DB_URL = 'file::memory:?cache=shared';

export async function createTestDb(): Promise<PrismaClient> {
  const adapter = new PrismaSqlite({ url: TEST_DB_URL });
  const prisma = new PrismaClient({ adapter });

  // Push Prisma schema to the shared in-memory SQLite database
  execSync('npx prisma db push --force-reset --skip-generate', {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'pipe',
  });

  return prisma;
}

export interface SeedResult {
  outlet: { id: string; name: string; timezone: string };
  owner: { id: string; username: string; password_hash: string; outlet_id: string };
}

export async function seedTestData(prisma: PrismaClient): Promise<SeedResult> {
  const outlet = await prisma.outlet.create({
    data: {
      name: 'Test Resto',
      timezone: 'Asia/Jakarta',
    },
  });

  const passwordHash = await bcrypt.hash('testpass123', 12);

  const owner = await prisma.ownerAccount.create({
    data: {
      username: 'testuser',
      password_hash: passwordHash,
      outlet_id: outlet.id,
    },
  });

  return { outlet, owner };
}
