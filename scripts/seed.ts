import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  await prisma.dailySalesReport.deleteMany();
  await prisma.statusLog.deleteMany();
  await prisma.salesTrend.deleteMany();
  await prisma.dailySales.deleteMany();
  await prisma.ownerAccount.deleteMany();
  await prisma.outlet.deleteMany();

  const outlet = await prisma.outlet.create({
    data: { name: 'Resto Utama', timezone: 'Asia/Jakarta' },
  });

  const passwordHash = await bcrypt.hash('admin123', 12);
  const owner = await prisma.ownerAccount.create({
    data: {
      username: 'admin',
      password_hash: passwordHash,
      outlet_id: outlet.id,
    },
  });

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const revenue = 1000000 + Math.floor(Math.random() * 1000000);
    const top_menu_items = ['Nasi Goreng', 'Ayam Bakar', 'Es Teh'];

    await prisma.dailySales.create({
      data: {
        date,
        revenue,
        top_menu_items: JSON.stringify(top_menu_items),
        outlet_id: outlet.id,
        data_source: 'REAL',
      },
    });
  }

  console.log('Seeded: 1 outlet, 1 owner (admin/admin123), 7 sales records');
  console.log('Login: username=admin, password=admin123');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
