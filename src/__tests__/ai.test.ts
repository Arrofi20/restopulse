import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('AI API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;
  let token: string;

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    const appModule = await import('../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;
    token = getAuthToken(ownerId, outletId);

    await db.prisma.salesTrend.createMany({
      data: [
        {
          date: new Date('2026-06-01T00:00:00Z'),
          revenue: 1000000,
          menu_popularity: JSON.stringify({
            items: [{ name: 'Nasi Goreng', count: 5, percentage: 50 }],
          }),
          outlet_id: outletId,
        },
        {
          date: new Date('2026-06-02T00:00:00Z'),
          revenue: 1500000,
          menu_popularity: JSON.stringify({
            items: [{ name: 'Mie Goreng', count: 3, percentage: 50 }],
          }),
          outlet_id: outletId,
        },
      ],
    });

    await db.prisma.monthlyExpense.createMany({
      data: [
        {
          outlet_id: outletId,
          category: 'BAHAN_BAKU',
          amount: 500000,
          month: 6,
          year: 2026,
        },
        {
          outlet_id: outletId,
          category: 'GAJI',
          amount: 300000,
          month: 6,
          year: 2026,
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  describe('POST /api/ai/summary', () => {
    it('returns mock summary when no GEMINI_API_KEY configured', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/ai/summary')
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '2026-06-01', end: '2026-06-30' });

      process.env.GEMINI_API_KEY = prevKey;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.isMock).toBe(true);
      expect(res.body.data.message).toContain('GEMINI_API_KEY');
    });

    it('returns noData when no sales exist for the date range', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/ai/summary')
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '2025-01-01', end: '2025-01-31' });

      process.env.GEMINI_API_KEY = prevKey;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.noData).toBe(true);
    });

    it('defaults to last 30 days when no dates provided', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/ai/summary')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      process.env.GEMINI_API_KEY = prevKey;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid date format with 400', async () => {
      const res = await request(app)
        .post('/api/ai/summary')
        .set('Authorization', `Bearer ${token}`)
        .send({ start: 'invalid', end: '2026-06-30' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects start > end with 400', async () => {
      const res = await request(app)
        .post('/api/ai/summary')
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '2026-06-30', end: '2026-06-01' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/ai/summary')
        .send({ start: '2026-06-01', end: '2026-06-30' });

      expect(res.status).toBe(401);
    });
  });
});

describe('AiService Prompt Builder', () => {
  let AiService: typeof import('../services/AiService').AiService;
  let AnalyticsService: typeof import('../services/AnalyticsService').AnalyticsService;

  beforeAll(async () => {
    const mod = await import('../services/AiService');
    AiService = mod.AiService;
    const analyticMod = await import('../services/AnalyticsService');
    AnalyticsService = analyticMod.AnalyticsService;
  });

  it('produces a prompt in Bahasa Indonesia with all required sections', async () => {
    const service = new AiService(new AnalyticsService());
    const prompt = (service as any).buildPrompt({
      outlet: { name: 'Test Resto' },
      period: { start: '2026-06-01', end: '2026-06-30' },
      trends: [
        { date: '2026-06-01', revenue: 1000000 },
        { date: '2026-06-02', revenue: 1500000 },
      ],
      summary: {
        totalRevenue: 2500000,
        dayCount: 2,
        averageDaily: 1250000,
        totalExpenses: 800000,
        profitLoss: 1700000,
        isLoss: false,
        topMenuItems: [
          { name: 'Nasi Goreng', count: 5, percentage: 50 },
          { name: 'Mie Goreng', count: 3, percentage: 30 },
        ],
        catering: {
          totalAmount: 5000000,
          totalCount: 1,
          byStatus: [{ status: 'CONFIRMED', count: 1, total: 5000000 }],
        },
      },
    });

    expect(prompt).toContain('Bahasa Indonesia');
    expect(prompt).toContain('Ringkasan Eksekutif');
    expect(prompt).toContain('Analisis Pendapatan');
    expect(prompt).toContain('Analisis Pengeluaran');
    expect(prompt).toContain('Analisis Catering');
    expect(prompt).toContain('Rekomendasi Bisnis');
    expect(prompt).toContain('Potensi Risiko');
    expect(prompt).toContain('Nasi Goreng');
    expect(prompt).toContain('UNTUNG');
  });
});
