import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, seedTestData, cleanupTestDb, TestDbResult } from './setup';
import type { ProfitLossService } from '../services/ProfitLossService';
import type { SalesTrendRepository } from '../repositories/SalesTrendRepository';
import type { MonthlyExpenseRepository } from '../repositories/MonthlyExpenseRepository';

describe('ProfitLossService', () => {
  let db: TestDbResult;
  let profitLossService: ProfitLossService;
  let outletId: string;

  beforeAll(async () => {
    db = await createTestDb();
    process.env.DATABASE_URL = 'file:' + db.dbPath;

    const { outlet } = await seedTestData(db.prisma);
    outletId = outlet.id;

    const { ProfitLossService } = await import('../services/ProfitLossService');
    const { SalesTrendRepository } = await import('../repositories/SalesTrendRepository');
    const { MonthlyExpenseRepository } = await import('../repositories/MonthlyExpenseRepository');

    const salesTrendRepo = new SalesTrendRepository();
    const expenseRepo = new MonthlyExpenseRepository();
    profitLossService = new ProfitLossService(salesTrendRepo, expenseRepo);

    await db.prisma.salesTrend.createMany({
      data: [
        {
          date: new Date('2026-06-01T00:00:00Z'),
          revenue: 2000000,
          menu_popularity: JSON.stringify({ items: [] }),
          outlet_id: outletId,
        },
        {
          date: new Date('2026-06-02T00:00:00Z'),
          revenue: 3000000,
          menu_popularity: JSON.stringify({ items: [] }),
          outlet_id: outletId,
        },
        {
          date: new Date('2026-06-03T00:00:00Z'),
          revenue: 2500000,
          menu_popularity: JSON.stringify({ items: [] }),
          outlet_id: outletId,
        },
      ],
    });

    await db.prisma.monthlyExpense.createMany({
      data: [
        {
          outlet_id: outletId,
          category: 'BAHAN_BAKU',
          amount: 1500000,
          month: 6,
          year: 2026,
        },
        {
          outlet_id: outletId,
          category: 'GAJI',
          amount: 2000000,
          month: 6,
          year: 2026,
        },
        {
          outlet_id: outletId,
          category: 'OPERASIONAL',
          amount: 500000,
          month: 6,
          year: 2026,
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestDb(db);
  });

  describe('calculateByDateRange', () => {
    it('correctly calculates profit when revenue exceeds expenses', async () => {
      const result = await profitLossService.calculateByDateRange(
        outletId,
        new Date('2026-06-01T00:00:00Z'),
        new Date('2026-06-30T23:59:59.999Z')
      );

      expect(result.totalRevenue).toBe(7500000);
      expect(result.totalExpenses).toBe(4000000);
      expect(result.profitLoss).toBe(3500000);
      expect(result.isLoss).toBe(false);
      expect(result.isBreakEven).toBe(false);
    });

    it('correctly calculates loss when expenses exceed revenue', async () => {
      await db.prisma.monthlyExpense.create({
        data: {
          outlet_id: outletId,
          category: 'LAINNYA',
          amount: 5000000,
          month: 6,
          year: 2026,
        },
      });

      const result = await profitLossService.calculateByDateRange(
        outletId,
        new Date('2026-06-01T00:00:00Z'),
        new Date('2026-06-30T23:59:59.999Z')
      );

      expect(result.totalRevenue).toBe(7500000);
      expect(result.totalExpenses).toBe(9000000);
      expect(result.profitLoss).toBe(-1500000);
      expect(result.isLoss).toBe(true);
      expect(result.isBreakEven).toBe(false);
    });

    it('returns zeros when no data exists for the date range', async () => {
      const result = await profitLossService.calculateByDateRange(
        outletId,
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59.999Z')
      );

      expect(result.totalRevenue).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.profitLoss).toBe(0);
      expect(result.isLoss).toBe(false);
      expect(result.isBreakEven).toBe(true);
    });
  });

  describe('calculateByPeriod', () => {
    it('calculates profit/loss for a specific month/year', async () => {
      const result = await profitLossService.calculateByPeriod(
        outletId,
        6,
        2026
      );

      expect(result.totalRevenue).toBe(7500000);
      expect(result.totalExpenses).toBe(9000000);
      expect(result.profitLoss).toBe(-1500000);
      expect(result.isLoss).toBe(true);
    });

    it('returns zeros for a period with no data', async () => {
      const result = await profitLossService.calculateByPeriod(
        outletId,
        1,
        2025
      );

      expect(result.totalRevenue).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.profitLoss).toBe(0);
      expect(result.isBreakEven).toBe(true);
    });
  });

  describe('calculateByDateStrings', () => {
    it('accepts YYYY-MM-DD string parameters', async () => {
      const result = await profitLossService.calculateByDateStrings(
        outletId,
        '2026-06-01',
        '2026-06-30'
      );

      expect(result.totalRevenue).toBe(7500000);
      expect(result.totalExpenses).toBe(9000000);
      expect(result.profitLoss).toBe(-1500000);
      expect(result.isLoss).toBe(true);
    });
  });

  describe('Single source of truth', () => {
    it('returns consistent results across different calculation methods', async () => {
      const byDateRange = await profitLossService.calculateByDateRange(
        outletId,
        new Date('2026-06-01T00:00:00Z'),
        new Date('2026-06-30T23:59:59.999Z')
      );

      const byPeriod = await profitLossService.calculateByPeriod(outletId, 6, 2026);

      const byDateStrings = await profitLossService.calculateByDateStrings(
        outletId,
        '2026-06-01',
        '2026-06-30'
      );

      expect(byDateRange.profitLoss).toBe(byPeriod.profitLoss);
      expect(byPeriod.profitLoss).toBe(byDateStrings.profitLoss);
      expect(byDateRange.totalRevenue).toBe(byPeriod.totalRevenue);
      expect(byDateRange.totalExpenses).toBe(byDateStrings.totalExpenses);
    });
  });
});
