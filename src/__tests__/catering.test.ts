import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Catering API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;
  let token: string;
  let orderId: string;

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

  describe('POST /api/catering', () => {
    it('creates a catering order and returns 201', async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'PT Sentosa Jaya',
          order_date: '2026-07-15',
          total_amount: 5000000,
          status: 'PENDING',
          notes: 'Acara ulang tahun kantor',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.client_name).toBe('PT Sentosa Jaya');
      expect(res.body.data.total_amount).toBe(5000000);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.notes).toBe('Acara ulang tahun kantor');

      orderId = res.body.data.id;
    });

    it('defaults status to PENDING if not provided', async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'CV Maju Bersama',
          order_date: '2026-08-01',
          total_amount: 3000000,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('rejects empty client name with 400', async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: '',
          order_date: '2026-07-15',
          total_amount: 5000000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects non-positive amount with 400', async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Test',
          order_date: '2026-07-15',
          total_amount: -500,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid status with 400', async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Test',
          order_date: '2026-07-15',
          total_amount: 5000000,
          status: 'CANCELLED',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/catering').send({
        client_name: 'Test',
        order_date: '2026-07-15',
        total_amount: 5000000,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/catering', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Restoran Nusantara',
          order_date: '2026-06-10',
          total_amount: 8000000,
          status: 'CONFIRMED',
        });
      await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Ibu Sari Catering',
          order_date: '2026-09-20',
          total_amount: 12000000,
          status: 'DONE',
        });
    });

    it('returns list of all catering orders', async () => {
      const res = await request(app)
        .get('/api/catering')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by status', async () => {
      const res = await request(app)
        .get('/api/catering?status=PENDING')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      for (const order of res.body.data) {
        expect(order.status).toBe('PENDING');
      }
    });

    it('filters by date range', async () => {
      const res = await request(app)
        .get('/api/catering?from=2026-06-01&to=2026-07-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('searches by client name', async () => {
      const res = await request(app)
        .get('/api/catering?search=Sentosa')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].client_name).toContain('Sentosa');
    });
  });

  describe('GET /api/catering/:id', () => {
    it('returns a single catering order by id', async () => {
      const res = await request(app)
        .get(`/api/catering/${orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(orderId);
      expect(res.body.data.client_name).toBe('PT Sentosa Jaya');
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/catering/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/catering/:id', () => {
    it('updates non-status fields', async () => {
      const res = await request(app)
        .put(`/api/catering/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'PT Sentosa Jaya (Updated)',
          total_amount: 6000000,
          notes: 'Catatan diperbarui',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.client_name).toBe('PT Sentosa Jaya (Updated)');
      expect(res.body.data.total_amount).toBe(6000000);
      expect(res.body.data.notes).toBe('Catatan diperbarui');
    });

    it('rejects invalid update data with 400', async () => {
      const res = await request(app)
        .put(`/api/catering/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          total_amount: -100,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/catering/:id — Status Workflow', () => {
    let pendingOrderId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Status Test Order',
          order_date: '2026-10-01',
          total_amount: 2000000,
          status: 'PENDING',
        });
      pendingOrderId = res.body.data.id;
    });

    it('allows forward transition: PENDING -> CONFIRMED', async () => {
      const res = await request(app)
        .patch(`/api/catering/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('allows forward transition: CONFIRMED -> DONE', async () => {
      const res = await request(app)
        .patch(`/api/catering/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DONE');
    });

    it('rejects backward transition: DONE -> CONFIRMED', async () => {
      const res = await request(app)
        .patch(`/api/catering/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid status transition');
    });

    it('rejects backward transition: DONE -> PENDING', async () => {
      const res = await request(app)
        .patch(`/api/catering/${pendingOrderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'PENDING' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid status transition');
    });

    it('rejects backward transition: CONFIRMED -> PENDING via PUT', async () => {
      const createRes = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'Transition Test',
          order_date: '2026-11-01',
          total_amount: 1000000,
          status: 'CONFIRMED',
        });

      const res = await request(app)
        .put(`/api/catering/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'PENDING' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid status transition');
    });
  });

  describe('DELETE /api/catering/:id', () => {
    it('deletes a catering order and returns 200', async () => {
      const createRes = await request(app)
        .post('/api/catering')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client_name: 'To Delete',
          order_date: '2026-12-01',
          total_amount: 1000000,
        });

      const deleteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/catering/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for deleting non-existent order', async () => {
      const res = await request(app)
        .delete('/api/catering/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/catering/statuses', () => {
    it('returns available statuses', async () => {
      const res = await request(app)
        .get('/api/catering/statuses')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toContain('PENDING');
      expect(res.body.data).toContain('CONFIRMED');
      expect(res.body.data).toContain('DONE');
    });
  });
});
