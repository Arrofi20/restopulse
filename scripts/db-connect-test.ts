// Quick connectivity test using the project's Prisma setup
import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from 'prisma-adapter-sqlite';

const adapter = new PrismaSqlite({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });

prisma.$queryRaw`SELECT 1`
  .then(() => {
    console.log('DB OK');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
