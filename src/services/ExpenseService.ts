import prisma from '../lib/prisma';
import {
  MonthlyExpenseRepository,
  StatusLogRepository,
} from '../repositories';
import {
  createExpenseSchema,
  updateExpenseSchema,
  EXPENSE_CATEGORIES,
} from '../validation/dataManagement.schema';
import type { MonthlyExpense } from '@prisma/client';

export class ExpenseImmutableError extends Error {
  constructor(month: number, year: number) {
    super(
      `Pengeluaran untuk bulan ${month}/${year} tidak dapat diubah karena laporan bulanan sudah di-generate. ` +
        `Data keuangan bersifat immutable setelah laporan dibuat untuk menjaga integritas audit.`
    );
    this.name = 'ExpenseImmutableError';
  }
}

export class ExpenseService {
  private expenseRepo: MonthlyExpenseRepository;
  private statusLogRepo: StatusLogRepository;

  constructor(
    expenseRepo?: MonthlyExpenseRepository,
    statusLogRepo?: StatusLogRepository
  ) {
    this.expenseRepo = expenseRepo ?? new MonthlyExpenseRepository();
    this.statusLogRepo = statusLogRepo ?? new StatusLogRepository();
  }

  async createExpense(data: {
    category: string;
    amount: number;
    month: number;
    year: number;
    outlet_id: string;
    actor_id: string;
  }) {
    createExpenseSchema.parse(data);

    const isImmutable = await this.expenseRepo.hasReportForPeriod(
      data.outlet_id,
      data.month,
      data.year
    );
    if (isImmutable) {
      throw new ExpenseImmutableError(data.month, data.year);
    }

    return prisma.$transaction(async (tx) => {
      const created = await tx.monthlyExpense.create({
        data: {
          outlet_id: data.outlet_id,
          category: data.category,
          amount: data.amount,
          month: data.month,
          year: data.year,
        },
      });

      await tx.statusLog.create({
        data: {
          action: 'CREATE',
          entity_type: 'MonthlyExpense',
          entity_id: created.id,
          new_value: JSON.stringify(created),
          actor_id: data.actor_id,
        },
      });

      return created;
    });
  }

  async updateExpense(
    id: string,
    data: Partial<{
      category: string;
      amount: number;
      month: number;
      year: number;
    }>,
    actor_id: string
  ): Promise<MonthlyExpense> {
    updateExpenseSchema.parse(data);

    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new Error('Expense not found');
    }

    const checkMonth = data.month ?? existing.month;
    const checkYear = data.year ?? existing.year;

    const isImmutable = await this.expenseRepo.hasReportForPeriod(
      existing.outlet_id,
      checkMonth,
      checkYear
    );
    if (isImmutable) {
      throw new ExpenseImmutableError(checkMonth, checkYear);
    }

    const isOriginalImmutable = await this.expenseRepo.hasReportForPeriod(
      existing.outlet_id,
      existing.month,
      existing.year
    );
    if (isOriginalImmutable) {
      throw new ExpenseImmutableError(existing.month, existing.year);
    }

    const updateData: Record<string, unknown> = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.month !== undefined) updateData.month = data.month;
    if (data.year !== undefined) updateData.year = data.year;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.monthlyExpense.update({
        where: { id },
        data: updateData,
      });

      await tx.statusLog.create({
        data: {
          action: 'UPDATE',
          entity_type: 'MonthlyExpense',
          entity_id: id,
          old_value: JSON.stringify(existing),
          new_value: JSON.stringify(updated),
          actor_id,
        },
      });

      return updated;
    });
  }

  async getExpenses(
    outlet_id: string,
    month?: number,
    year?: number
  ): Promise<MonthlyExpense[]> {
    if (month && year) {
      return this.expenseRepo.findByOutletAndPeriod(outlet_id, month, year);
    }
    if (year) {
      const expenses: MonthlyExpense[] = [];
      for (let m = 1; m <= 12; m++) {
        const rows = await this.expenseRepo.findByOutletAndPeriod(
          outlet_id,
          m,
          year
        );
        expenses.push(...rows);
      }
      return expenses;
    }
    return this.expenseRepo.findByOutlet(outlet_id, { limit: 200 });
  }

  async getExpensesPaginated(
    outlet_id: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: 'created_at' | 'amount' | 'year' | 'month';
      order?: 'asc' | 'desc';
    }
  ): Promise<{ expenses: MonthlyExpense[]; total: number }> {
    const expenses = await this.expenseRepo.findByOutlet(outlet_id, options);
    const total = await this.expenseRepo.countByOutlet(outlet_id);
    return { expenses, total };
  }

  async getExpenseById(id: string): Promise<MonthlyExpense | null> {
    return this.expenseRepo.findById(id);
  }

  async deleteExpense(id: string, actor_id: string): Promise<MonthlyExpense> {
    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new Error('Expense not found');
    }

    const isImmutable = await this.expenseRepo.hasReportForPeriod(
      existing.outlet_id,
      existing.month,
      existing.year
    );
    if (isImmutable) {
      throw new ExpenseImmutableError(existing.month, existing.year);
    }

    return prisma.$transaction(async (tx) => {
      await tx.statusLog.create({
        data: {
          action: 'DELETE',
          entity_type: 'MonthlyExpense',
          entity_id: id,
          old_value: JSON.stringify(existing),
          actor_id,
        },
      });

      return tx.monthlyExpense.delete({ where: { id } });
    });
  }

  getCategories() {
    return EXPENSE_CATEGORIES;
  }
}
