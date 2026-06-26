import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import { getAuthToken } from './helpers';

describe('Auth API', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;

  beforeAll(async () => {
    db = await createTestDb();
    // Point controllers at the test database
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    // Dynamic import so prisma singleton reads the test DATABASE_URL
    const appModule = await import('../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  // AUTH-01: Register flow
  it('POST /api/auth/register — creates new owner + outlet and returns 201 + JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newowner', password: 'securepass123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.length).toBeGreaterThan(0);
    expect(res.body.data.owner.username).toBe('newowner');
  });

  it('POST /api/auth/register — rejects duplicate username with error', async () => {
    // First registration succeeds
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupuser', password: 'pass123456' });

    // Second registration with same username must fail
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupuser', password: 'pass123456' });

    expect(res.status).not.toBe(201);
    expect(res.body.success).toBe(false);
  });

  // AUTH-01: Login flow
  it('POST /api/auth/login — returns JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.length).toBeGreaterThan(0);
    expect(res.body.data.owner.username).toBe('testuser');
  });

  it('POST /api/auth/login — rejects invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('LOGIN_ERROR');
  });

  it('POST /api/auth/login — rejects non-existent username with 401 (or 429 if rate-limited)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghostuser', password: 'somepass123' });

    // Accept 401 (expected) or 429 (rate-limited after prior requests)
    expect([401, 429]).toContain(res.status);
    expect(res.body.success).toBe(false);
    if (res.status === 401) {
      expect(res.body.error.code).toBe('LOGIN_ERROR');
    } else {
      expect(res.body.error.code).toBe('RATE_LIMITED');
    }
  });

  // Logout
  it('POST /api/auth/logout — returns 200 (or 429 if rate-limited)', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    // Accept 200 (expected) or 429 (rate-limited after prior requests)
    expect([200, 429]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Logged out successfully');
    } else {
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RATE_LIMITED');
    }
  });

  // AUTH-02: Unauthenticated access
  it('GET /api/dashboard — rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/dashboard — rejects malformed Bearer token with 401', async () => {
    const res = await request(app)
      .get('/api/dashboard?start=2026-06-01&end=2026-06-30')
      .set('Authorization', 'Bearer not.a.valid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
