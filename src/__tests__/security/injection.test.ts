import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Application } from 'express';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from '../setup';

const TEST_SECRET = process.env.JWT_SECRET || 'fallback-secret-not-for-production';

// ------------------------------------------------------------------
// Replicate escapeCell() logic for black-box CSV injection verification
// (canonical implementation lives in frontend/src/lib/csvGenerator.ts)
// ------------------------------------------------------------------
const FORMULA_INJECTION_PREFIXES = ['=', '+', '-', '@'];

function escapeCell(value: unknown): string {
  let str = value == null ? '' : String(value);

  if (str.length > 0 && FORMULA_INJECTION_PREFIXES.includes(str[0])) {
    str = `\t${str}`;
  }

  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// ------------------------------------------------------------------
// All DB-dependent tests share ONE describe block to avoid Prisma
// singleton conflicts (prisma is stored on globalThis — see
// src/lib/prisma.ts). Splitting across describe blocks causes the
// second block's dynamic import to return the cached module with
// the first block's (now-disconnected) PrismaClient.
// ------------------------------------------------------------------
describe('Injection Vectors & Error Leakage (DB-dependent)', () => {
  let db: TestDbResult;
  let app: Application;
  let ownerId: string;
  let outletId: string;

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;
    const appModule = await import('../../app');
    app = appModule.app;

    const { outlet, owner } = await seedTestData(db.prisma);
    outletId = outlet.id;
    ownerId = owner.id;
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  // =================================================================
  // SQL Injection via Query Parameters
  // =================================================================

  it('rejects SQL injection in dashboard date params (Zod rejects format)', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get("/api/dashboard?start=2026-06-01' OR '1'='1&end=2026-06-26")
      .set('Authorization', `Bearer ${token}`);

    // Zod dateRangeSchema regex requires YYYY-MM-DD — the SQL payload
    // violates this, so we expect a 400 VALIDATION_ERROR.
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('stores SQL injection in menu_items as literal string (no SQL execution)', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-25',
        revenue: 500000,
        top_menu_items: ["Nasi Goreng' OR '1'='1"],
      });

    // Should succeed (201) — SQL injection in a field value is harmless with
    // Prisma parameterized queries. The string is stored as-is.
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // The stored value is the literal menu item name, not executed SQL
    expect(res.body.data.top_menu_items).toContain("Nasi Goreng' OR '1'='1");
  });

  it('rejects SQL injection in report date params (Zod rejects format)', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get("/api/report?start=2026-06-01'; DROP TABLE DailySales;--&end=2026-06-26")
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // =================================================================
  // XSS Injection via Sales Body
  // =================================================================

  it('stores XSS payload in menu_items as literal string (React escapes on render)', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-26',
        revenue: 500000,
        top_menu_items: ["<script>alert('xss')</script>"],
      });

    // XSS string stored as-is; React JSX auto-escapes HTML on render.
    // The frontend never uses dangerouslySetInnerHTML (verified: zero grep hits).
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.top_menu_items).toContain("<script>alert('xss')</script>");
  });

  // =================================================================
  // Error Response Leakage
  // =================================================================

  it('Zod validation errors return clean messages, no stack traces', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 'invalid', revenue: -100 })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();

    // No stack trace leakage
    expect(res.body.error.stack).toBeUndefined();
    expect(res.body.error.stacktrace).toBeUndefined();
    expect(res.body.stack).toBeUndefined();

    // Details should be user-readable arrays, not raw Zod internals
    res.body.error.details?.forEach((d: any) => {
      expect(d.path).toBeDefined();
      expect(d.message).toBeDefined();
      expect(typeof d.message).toBe('string');
    });
  });

  it('duplicate sales check returns clean error without database internals', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    // First insert
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-24',
        revenue: 500000,
        top_menu_items: ['Nasi Goreng'],
      });

    // Duplicate insert — SalesService catches duplicate before Prisma,
    // returns 400 SALE_ERROR. This is consistent with the existing
    // sales.test.ts duplicate detection test.
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-06-24',
        revenue: 600000,
        top_menu_items: ['Mie Ayam'],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SALE_ERROR');
    // Error message from SalesService, not Prisma internals
    expect(res.body.error.message).toBe('Sales record already exists for this date');
    expect(res.body.error.message).not.toContain('P2002');
    expect(res.body.error.message).not.toContain('UNIQUE constraint');
  });

  it('empty sales body returns clean Zod error (no stack trace)', async () => {
    const token = jwt.sign({ userId: ownerId, outletId }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.stack).toBeUndefined();
    expect(res.body.error.stacktrace).toBeUndefined();
  });
});

// ------------------------------------------------------------------
// CSV Injection Mitigation — Pure unit tests (no DB needed)
// ------------------------------------------------------------------
describe('CSV Injection Mitigation — escapeCell() Verification', () => {
  it('prefixes cell starting with "=" with tab character', () => {
    expect(escapeCell('=1+2')).toBe('\t=1+2');
  });

  it('prefixes cell starting with "+" with tab character', () => {
    expect(escapeCell('+SUM(A1:A10)')).toBe('\t+SUM(A1:A10)');
  });

  it('prefixes cell starting with "-" with tab character', () => {
    expect(escapeCell('-A1+A2')).toBe('\t-A1+A2');
  });

  it('prefixes cell starting with "@" with tab character', () => {
    expect(escapeCell('@SUM(A1:A10)')).toBe('\t@SUM(A1:A10)');
  });

  it('does NOT prefix normal text with tab character', () => {
    expect(escapeCell('Normal Text')).toBe('Normal Text');
    expect(escapeCell('12345')).toBe('12345');
  });

  it('still applies RFC 4180 quoting after formula injection mitigation', () => {
    // Input: '=1+2";DROP TABLE' → after tab prefix: '\t=1+2";DROP TABLE'
    // Since it contains ';' and '"', RFC 4180 quoting wraps it:
    // Result: '"\t=1+2"";DROP TABLE"'
    // The cell VALUE starts with \t (formula neutralized), but the escaped
    // CSV cell string starts with " (RFC 4180 quote wrapper).
    const result = escapeCell('=1+2";DROP TABLE');
    // The result must start with " (RFC 4180 quoting)
    expect(result.startsWith('"')).toBe(true);
    // The tab prefix must be present inside the quoted cell (formula mitigation)
    expect(result).toContain('\t');
    // Internal double quotes must be escaped (doubled)
    expect(result).toContain('""');
  });

  it('handles null/undefined values safely', () => {
    expect(escapeCell(null)).toBe('');
    expect(escapeCell(undefined)).toBe('');
  });
});
