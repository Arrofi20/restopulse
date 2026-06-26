import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { unlinkSync } from 'fs';
import { resolve } from 'path';
import bcrypt from 'bcrypt';

export interface TestDbResult {
  prisma: PrismaClient;
  dbPath: string;
}

/**
 * Creates an isolated test database using a temporary SQLite file.
 * Uses a unique filename per call to guarantee isolation between test suites.
 * The caller is responsible for cleaning up the file via cleanupTestDb().
 */
export async function createTestDb(): Promise<TestDbResult> {
  const dbName = `test-${randomUUID()}.db`;
  const dbPath = resolve(__dirname, '..', '..', 'prisma', dbName);
  const dbUrl = `file:${dbPath}`;

  // Push Prisma schema to the temp database
  execSync(`npx prisma db push --force-reset --url "${dbUrl}"`, {
    stdio: 'pipe',
  });

  // Create PrismaClient connected to the same temp database
  const adapter = new PrismaSqlite({ url: dbUrl });
  const prisma = new PrismaClient({ adapter });

  return { prisma, dbPath };
}

/**
 * Clean up the test database file and disconnect the Prisma client.
 */
export async function cleanupTestDb(result: TestDbResult): Promise<void> {
  await result.prisma.$disconnect();
  try {
    unlinkSync(result.dbPath);
  } catch {
    // File may already be deleted or never created — ignore
  }
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
