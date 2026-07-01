import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Expense API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;
  let token: string;
  let expenseId: string;

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    const appModule = await import('../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;
    token = getAuthToken(ownerId, outletId);
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  describe('POST /api/expenses', () => {
    it('creates an expense and returns 201', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'BAHAN_BAKU',
          amount: 5000000,
          month: 6,
          year: 2026,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.category).toBe('BAHAN_BAKU');
      expect(res.body.data.amount).toBe(5000000);
      expect(res.body.data.month).toBe(6);
      expect(res.body.data.year).toBe(2026);

      expenseId = res.body.data.id;
    });

    it('rejects invalid category with 400', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'INVALID',
          amount: 100000,
          month: 6,
          year: 2026,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects non-positive amount with 400', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'GAJI',
          amount: -500,
          month: 6,
          year: 2026,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid month with 400', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'GAJI',
          amount: 500000,
          month: 13,
          year: 2026,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({
          category: 'GAJI',
          amount: 500000,
          month: 6,
          year: 2026,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/expenses', () => {
    it('returns list of expenses', async () => {
      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('returns expenses filtered by month and year', async () => {
      const res = await request(app)
        .get('/api/expenses?month=6&year=2026')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].month).toBe(6);
      expect(res.body.data[0].year).toBe(2026);
    });

    it('supports pagination', async () => {
      const res = await request(app)
        .get('/api/expenses?limit=1&offset=0&orderBy=amount&order=asc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/expenses');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('returns a single expense by id', async () => {
      const res = await request(app)
        .get(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(expenseId);
    });

    it('returns 404 for non-existent expense', async () => {
      const res = await request(app)
        .get('/api/expenses/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('updates an expense and returns 200', async () => {
      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 6000000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(6000000);
    });

    it('rejects invalid update data with 400', async () => {
      const res = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -100,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('deletes an expense and returns 200', async () => {
      const createRes = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'OPERASIONAL',
          amount: 200000,
          month: 7,
          year: 2026,
        });

      const deleteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/expenses/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for deleting non-existent expense', async () => {
      const res = await request(app)
        .delete('/api/expenses/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/expenses/categories', () => {
    it('returns available categories', async () => {
      const res = await request(app)
        .get('/api/expenses/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('BAHAN_BAKU');
      expect(res.body.data).toContain('GAJI');
      expect(res.body.data).toContain('OPERASIONAL');
      expect(res.body.data).toContain('LAINNYA');
    });
  });

  describe('Expense Immutability', () => {
    let immutableExpenseId: string;
    const testMonth = 8;
    const testYear = 2026;

    beforeAll(async () => {
      const createRes = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'LAINNYA',
          amount: 300000,
          month: testMonth,
          year: testYear,
        });

      immutableExpenseId = createRes.body.data.id;

      const monthStart = new Date(Date.UTC(testYear, testMonth - 1, 1));
      const monthEnd = new Date(Date.UTC(testYear, testMonth, 0, 23, 59, 59, 999));

      await db.prisma.dailySalesReport.create({
        data: {
          period_start: monthStart,
          period_end: monthEnd,
          total_revenue: 10000000,
          transaction_count: 30,
          top_items: JSON.stringify({ items: [] }),
          outlet_id: outletId,
        },
      });
    });

    it('blocks creating expense for a period with a generated report (403)', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'GAJI',
          amount: 500000,
          month: testMonth,
          year: testYear,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EXPENSE_IMMUTABLE');
    });

    it('blocks updating expense for a period with a generated report (403)', async () => {
      const res = await request(app)
        .put(`/api/expenses/${immutableExpenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 999999,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EXPENSE_IMMUTABLE');
    });

    it('blocks deleting expense for a period with a generated report (403)', async () => {
      const res = await request(app)
        .delete(`/api/expenses/${immutableExpenseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EXPENSE_IMMUTABLE');
    });
  });
});
