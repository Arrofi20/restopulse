import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Dashboard API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    const appModule = await import('../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;

    // Seed SalesTrend data for date range 2026-06-01 to 2026-06-03
    await db.prisma.salesTrend.createMany({
      data: [
        {
          date: new Date('2026-06-01T00:00:00Z'),
          revenue: 500000,
          menu_popularity: JSON.stringify({
            items: [
              { name: 'Nasi Goreng', count: 3, percentage: 50 },
              { name: 'Es Teh', count: 3, percentage: 50 },
            ],
          }),
          outlet_id: outletId,
        },
        {
          date: new Date('2026-06-02T00:00:00Z'),
          revenue: 450000,
          menu_popularity: JSON.stringify({
            items: [
              { name: 'Mie Goreng', count: 2, percentage: 66.67 },
              { name: 'Es Jeruk', count: 1, percentage: 33.33 },
            ],
          }),
          outlet_id: outletId,
        },
        {
          date: new Date('2026-06-03T00:00:00Z'),
          revenue: 600000,
          menu_popularity: JSON.stringify({
            items: [
              { name: 'Ayam Bakar', count: 4, percentage: 80 },
              { name: 'Kopi', count: 1, percentage: 20 },
            ],
          }),
          outlet_id: outletId,
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  // DASH-01: Dashboard data structure
  it('GET /api/dashboard?start=&end= — returns 200 + dashboard data structure', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    // Outlet name for header (D-17/D-18)
    expect(res.body.data.outlet).toBeDefined();
    expect(res.body.data.outlet.name).toBe('Test Resto');

    // Trends array for Line Chart (DASH-01)
    expect(res.body.data.trends).toBeDefined();
    expect(Array.isArray(res.body.data.trends)).toBe(true);
    expect(res.body.data.trends.length).toBeGreaterThanOrEqual(3);

    // Summary data
    expect(res.body.data.summary).toBeDefined();
    expect(typeof res.body.data.summary.totalRevenue).toBe('number');
    expect(typeof res.body.data.summary.dayCount).toBe('number');
  });

  // DASH-01: Trends data structure
  it('GET /api/dashboard?start=&end= — trends contain date + revenue, ordered by date ascending', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    const trends = res.body.data.trends;
    expect(trends.length).toBeGreaterThanOrEqual(3);

    // Each trend item must have date and revenue fields
    for (const trend of trends) {
      expect(trend.date).toBeDefined();
      expect(typeof trend.revenue).toBe('number');
    }

    // Trends ordered by date ascending
    for (let i = 1; i < trends.length; i++) {
      const prevDate = new Date(trends[i - 1].date);
      const currDate = new Date(trends[i].date);
      expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
    }
  });

  // DASH-02: Menu popularity data
  it('GET /api/dashboard?start=&end= — trends contain parsed menu_popularity data', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    const trends = res.body.data.trends;

    // At least one trend should have menu_popularity as an object (parsed from JSON)
    const trendWithMenu = trends.find(
      (t: any) =>
        t.menu_popularity &&
        typeof t.menu_popularity === 'object' &&
        Array.isArray(t.menu_popularity.items)
    );
    expect(trendWithMenu).toBeDefined();

    // Verify menu_popularity structure
    const menuPop = trendWithMenu.menu_popularity;
    expect(Array.isArray(menuPop.items)).toBe(true);
    if (menuPop.items.length > 0) {
      const item = menuPop.items[0];
      expect(item.name).toBeDefined();
      expect(typeof item.count).toBe('number');
      expect(typeof item.percentage).toBe('number');
    }
  });

  // Dashboard auth check
  it('GET /api/dashboard — rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // Date validation
  it('GET /api/dashboard?start=2026-06-30&end=2026-06-01 — start > end returns 400', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-30&end=2026-06-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
