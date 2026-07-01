import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ExpenseService, ExpenseImmutableError } from '../services/ExpenseService';
import { ZodError } from 'zod';
import { expenseQuerySchema } from '../validation/dataManagement.schema';

export class ExpenseController {
  private expenseService: ExpenseService;

  constructor(expenseService?: ExpenseService) {
    this.expenseService = expenseService ?? new ExpenseService();
  }

  static getInstance(): ExpenseController {
    return new ExpenseController();
  }

  async createExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, amount, month, year } = req.body;
      const outletId = req.user!.outletId;
      const userId = req.user!.userId;

      const expense = await this.expenseService.createExpense({
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
        outlet_id: outletId,
        actor_id: userId,
      });

      res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        });
      } else if (error instanceof ExpenseImmutableError) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EXPENSE_IMMUTABLE',
            message: error.message,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'EXPENSE_ERROR', message: error.message },
        });
      }
    }
  }

  async updateExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const { category, amount, month, year } = req.body;
      const userId = req.user!.userId;

      const updateData: Partial<{
        category: string;
        amount: number;
        month: number;
        year: number;
      }> = {};

      if (category !== undefined) updateData.category = category;
      if (amount !== undefined) updateData.amount = Number(amount);
      if (month !== undefined) updateData.month = Number(month);
      if (year !== undefined) updateData.year = Number(year);

      const updated = await this.expenseService.updateExpense(
        id,
        updateData,
        userId
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        });
      } else if (error instanceof ExpenseImmutableError) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EXPENSE_IMMUTABLE',
            message: error.message,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'EXPENSE_ERROR', message: error.message },
        });
      }
    }
  }

  async getExpenses(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = expenseQuerySchema.parse(req.query);
      const outletId = req.user!.outletId;

      if (parsed.limit !== undefined || parsed.offset !== undefined) {
        const { expenses, total } =
          await this.expenseService.getExpensesPaginated(outletId, {
            limit: parsed.limit,
            offset: parsed.offset,
            orderBy: parsed.orderBy,
            order: parsed.order,
          });

        res.status(200).json({
          success: true,
          data: expenses,
          meta: { total, limit: parsed.limit ?? 100, offset: parsed.offset ?? 0 },
        });
      } else {
        const expenses = await this.expenseService.getExpenses(
          outletId,
          parsed.month,
          parsed.year
        );

        res.status(200).json({ success: true, data: expenses });
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.issues,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        });
      }
    }
  }

  async getExpenseById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const expense = await this.expenseService.getExpenseById(id);

      if (!expense) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Expense not found' },
        });
        return;
      }

      res.status(200).json({ success: true, data: expense });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      });
    }
  }

  async deleteExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;

      await this.expenseService.deleteExpense(id, userId);

      res.status(200).json({
        success: true,
        data: { message: 'Expense deleted successfully' },
      });
    } catch (error: any) {
      if (error instanceof ExpenseImmutableError) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EXPENSE_IMMUTABLE',
            message: error.message,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'DELETE_ERROR', message: error.message },
        });
      }
    }
  }

  async getCategories(_req: AuthenticatedRequest, res: Response) {
    res.status(200).json({
      success: true,
      data: this.expenseService.getCategories(),
    });
  }
}
