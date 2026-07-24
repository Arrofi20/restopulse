import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getSqliteUrl(): string {
  const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const filePath = url.replace(/^file:/, '');
  if (!path.isAbsolute(filePath)) {
    return 'file:' + path.resolve(process.cwd(), filePath);
  }
  return url;
}

function getAdapter() {
  const provider = process.env.DB_PROVIDER || 'sqlite';

  if (provider === 'postgresql') {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required when DB_PROVIDER=postgresql');
    }
    return new PrismaPg({ connectionString });
  }

  return new PrismaSqlite({ url: getSqliteUrl() });
}

const adapter = getAdapter();

function createClient(): PrismaClient {
  const client = new PrismaClient({ adapter });

  if (process.env.DB_PROVIDER !== 'postgresql') {
    client.$connect().then(async () => {
      try {
        await client.$executeRawUnsafe('PRAGMA journal_mode=WAL');
        await client.$executeRawUnsafe('PRAGMA busy_timeout=5000');
        await client.$executeRawUnsafe('PRAGMA foreign_keys=ON');
      } catch {
        // pragmas may fail on some platforms — non-fatal
      }
    }).catch(() => {
      // connection may fail outside API context — defer to first request
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;