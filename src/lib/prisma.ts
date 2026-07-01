import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const filePath = url.replace(/^file:/, '');
  if (!path.isAbsolute(filePath)) {
    return 'file:' + path.resolve(process.cwd(), filePath);
  }
  return url;
}

const adapter = new PrismaSqlite({
  url: getDbUrl(),
});

function createClient(): PrismaClient {
  const client = new PrismaClient({ adapter });

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

  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
