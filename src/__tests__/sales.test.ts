import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Sales API', () => {
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
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  // DATA-02: Create sale
  it('POST /api/sales — creates a new daily sales record, returns 201', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: 500000,
        top_menu_items: ['Nasi Goreng', 'Es Teh'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.date).toBeDefined();
    expect(res.body.data.revenue).toBe(500000);
    expect(res.body.data.top_menu_items).toBeDefined();
    expect(res.body.data.outlet_id).toBe(outletId);
  });

  // DATA-02: Validation errors
  it('POST /api/sales — rejects missing required fields with 400 + Zod validation errors', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('POST /api/sales — rejects missing revenue and top_menu_items', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-06-26' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('POST /api/sales — rejects invalid date format', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: 'not-a-date',
        revenue: 500000,
        top_menu_items: ['Test'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/sales — rejects negative revenue', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: -100,
        top_menu_items: ['Test'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/sales — rejects empty top_menu_items array', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: 500000,
        top_menu_items: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // DATA-02: Duplicate detection
  it('POST /api/sales — rejects duplicate date for same outlet', async () => {
    const token = getAuthToken(ownerId, outletId);

    // Create first sale
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: 500000,
        top_menu_items: ['Nasi Goreng'],
      });

    // Second sale with same date
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: 600000,
        top_menu_items: ['Mie Ayam'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SALE_ERROR');
    expect(res.body.error.message).toBe('Sales record already exists for this date');
  });

  // Unauthenticated sales POST
  it('POST /api/sales — rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/sales')
      .send({
        date: '2026-06-26',
        revenue: 500000,
        top_menu_items: ['Nasi Goreng'],
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // DATA-01: Dummy inject
  it('POST /api/admin/dummy-inject — creates dummy data and returns success', async () => {
    const token = getAuthToken(ownerId, outletId);
    const res = await request(app)
      .post('/api/admin/dummy-inject')
      .set('Authorization', `Bearer ${token}`)
      .send({ days: 7, confirm: 'HAPUS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.inserted).toBeGreaterThan(0);
  });

  // GET /api/sales — list sales
  it('GET /api/sales — returns sales records list', async () => {
    const token = getAuthToken(ownerId, outletId);

    // Create some sales first
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-06-20', revenue: 400000, top_menu_items: ['Soto Ayam'] });
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-06-21', revenue: 450000, top_menu_items: ['Rendang'] });
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-06-22', revenue: 500000, top_menu_items: ['Nasi Goreng'] });

    // GET /api/sales requires dateRangeSchema validation — pass start/end params
    const res = await request(app)
      .get('/api/sales?start=2026-06-01&end=2026-06-30')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });
});
