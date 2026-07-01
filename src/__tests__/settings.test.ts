import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Settings API', () => {
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
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  describe('GET /api/settings/gemini', () => {
    it('returns config status (not configured when no key)', async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      process.env.GEMINI_API_KEY = prevKey;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.configured).toBe(false);
      expect(res.body.data.source).toBe('none');
      expect(res.body.data.model).toBe('gemini-2.5-flash');
    });

    it('returns env source when GEMINI_API_KEY is set', async () => {
      process.env.GEMINI_API_KEY = 'test-env-key-1234567890';

      const res = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      delete process.env.GEMINI_API_KEY;

      expect(res.status).toBe(200);
      expect(res.body.data.configured).toBe(true);
      expect(res.body.data.source).toBe('env');
      expect(res.body.data.maskedKey).toContain('***');
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/settings/gemini');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/settings/gemini', () => {
    it('saves an API key', async () => {
      const res = await request(app)
        .post('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`)
        .send({ apiKey: 'AIzaSyTestKey1234567890abcdef' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const configRes = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      expect(configRes.body.data.configured).toBe(true);
      expect(configRes.body.data.source).toBe('database');
      expect(configRes.body.data.maskedKey).toContain('***');
      expect(configRes.body.data.maskedKey).not.toContain('AIzaSyTestKey');
    });

    it('rejects empty API key', async () => {
      const res = await request(app)
        .post('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`)
        .send({ apiKey: '' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects too-short API key', async () => {
      const res = await request(app)
        .post('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`)
        .send({ apiKey: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SETTINGS_ERROR');
    });

    it('updates an existing API key', async () => {
      await request(app)
        .post('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`)
        .send({ apiKey: 'AIzaSyFirstKey1234567890abcdef' });

      const res = await request(app)
        .post('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`)
        .send({ apiKey: 'AIzaSySecondKey9876543210fedcba' });

      expect(res.status).toBe(200);

      const configRes = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      expect(configRes.body.data.maskedKey).toContain('***');
    });
  });

  describe('POST /api/settings/gemini/model', () => {
    it('saves a valid model', async () => {
      const res = await request(app)
        .post('/api/settings/gemini/model')
        .set('Authorization', `Bearer ${token}`)
        .send({ model: 'gemini-2.5-pro' });

      expect(res.status).toBe(200);

      const configRes = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      expect(configRes.body.data.model).toBe('gemini-2.5-pro');
    });

    it('rejects invalid model', async () => {
      const res = await request(app)
        .post('/api/settings/gemini/model')
        .set('Authorization', `Bearer ${token}`)
        .send({ model: 'gpt-4' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/settings/gemini/models', () => {
    it('returns available models', async () => {
      const res = await request(app)
        .get('/api/settings/gemini/models')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toContain('gemini-2.5-flash');
      expect(res.body.data).toContain('gemini-2.5-pro');
    });
  });

  describe('DELETE /api/settings/gemini', () => {
    it('deletes the stored API key', async () => {
      const res = await request(app)
        .delete('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const prevKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const configRes = await request(app)
        .get('/api/settings/gemini')
        .set('Authorization', `Bearer ${token}`);

      process.env.GEMINI_API_KEY = prevKey;

      expect(configRes.body.data.configured).toBe(false);
      expect(configRes.body.data.source).toBe('none');
    });
  });
});
