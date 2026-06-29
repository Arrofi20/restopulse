import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Report API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;

  const date20260601 = new Date('2026-06-01T00:00:00Z');
  const date20260615 = new Date('2026-06-15T00:00:00Z');
  const date20260630 = new Date('2026-06-30T00:00:00Z');

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    const appModule = await import('../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;

    // Seed SalesTrend records (used for revenue + menu popularity)
    await db.prisma.salesTrend.createMany({
      data: [
        {
          date: date20260601,
          revenue: 100000,
          menu_popularity: JSON.stringify({
            items: [{ name: 'Nasi Goreng', count: 2, percentage: 100 }],
          }),
          outlet_id: outletId,
        },
        {
          date: date20260615,
          revenue: 200000,
          menu_popularity: JSON.stringify({
            items: [
              { name: 'Mie Goreng', count: 3, percentage: 60 },
              { name: 'Es Teh', count: 2, percentage: 40 },
            ],
          }),
          outlet_id: outletId,
        },
        {
          date: date20260630,
          revenue: 300000,
          menu_popularity: JSON.stringify({
            items: [{ name: 'Ayam Bakar', count: 1, percentage: 100 }],
          }),
          outlet_id: outletId,
        },
      ],
    });

    // Seed DailySales records (used for day counts)
    await db.prisma.dailySales.createMany({
      data: [
        {
          date: date20260601,
          revenue: 100000,
          top_menu_items: JSON.stringify(['Nasi Goreng']),
          outlet_id: outletId,
          data_source: 'REAL',
        },
        {
          date: date20260615,
          revenue: 200000,
          top_menu_items: JSON.stringify(['Mie Goreng', 'Es Teh']),
          outlet_id: outletId,
          data_source: 'REAL',
        },
        {
          date: date20260630,
          revenue: 300000,
          top_menu_items: JSON.stringify(['Ayam Bakar']),
          outlet_id: outletId,
          data_source: 'REAL',
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  // REPT-01/02: Report data structure
  it('GET /api/report?start=&end= — returns 200 + report data structure', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/report?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // REPT-02: Required fields for PDF/CSV generation
  it('GET /api/report?start=&end= — response contains required fields for export', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/report?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    const data = res.body.data;

    // Outlet name for filename (D-29)
    expect(data.outlet).toBeDefined();
    expect(data.outlet.name).toBe('Test Resto');

    // Period for filename + report header
    expect(data.period).toBeDefined();
    expect(data.period.start).toBe('2026-06-01');
    expect(data.period.end).toBe('2026-06-30');

    // Summary with aggregate data
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.totalRevenue).toBe('number');
    expect(typeof data.summary.dayCount).toBe('number');

    // Rows array
    expect(data.rows).toBeDefined();
    expect(Array.isArray(data.rows)).toBe(true);
    expect(data.rows.length).toBeGreaterThanOrEqual(3);

    // Each row has required fields
    for (const row of data.rows) {
      expect(row.date).toBeDefined();
      expect(typeof row.date).toBe('string');
      expect(typeof row.revenue).toBe('number');
      expect(row.topMenu).toBeDefined();
      expect(typeof row.dayCount).toBe('number');
    }
  });

  // REPT-01: Date filtering
  it('GET /api/report?start=&end= — returns only records within the requested date range', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/report?start=2026-06-01&end=2026-06-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const rows = res.body.data.rows;
    expect(rows.length).toBe(2);

    const dates = rows.map((r: any) => r.date);
    expect(dates).toContain('2026-06-01');
    expect(dates).toContain('2026-06-15');
    expect(dates).not.toContain('2026-06-30');
  });

  // REPT-01: Aggregation accuracy
  it('GET /api/report?start=&end= — total revenue is sum of seeded values', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/report?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    // Seeded: 100000 + 200000 + 300000 = 600000
    expect(res.body.data.summary.totalRevenue).toBe(600000);

    // Transaction count = number of days with sales = 3
    expect(res.body.data.summary.dayCount).toBe(3);
  });

  // Date validation
  it('GET /api/report?start=2026-06-30&end=2026-06-01 — start > end returns 400', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .get('/api/report?start=2026-06-30&end=2026-06-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Unauthenticated access
  it('GET /api/report — rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .get('/api/report?start=2026-06-01&end=2026-06-30');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
