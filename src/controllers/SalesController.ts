import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SalesService } from '../services/SalesService';
import {
  DailySalesRepository,
  StatusLogRepository,
  SalesTrendRepository,
} from '../repositories';
import { ZodError } from 'zod';

export class SalesController {
  private salesService: SalesService;

  constructor(salesService: SalesService) {
    this.salesService = salesService;
  }

  static getInstance(): SalesController {
    return new SalesController(
      new SalesService(
        new DailySalesRepository(),
        new StatusLogRepository(),
        new SalesTrendRepository()
      )
    );
  }

  async createSale(req: AuthenticatedRequest, res: Response) {
    try {
      const { date, revenue, top_menu_items } = req.body;
      const outletId = req.user!.outletId;
      const userId = req.user!.userId;

      const sale = await this.salesService.createSale({
        date,
        revenue,
        top_menu_items,
        outlet_id: outletId,
        actor_id: userId,
      });

      res.status(201).json({ success: true, data: sale });
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
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'SALE_ERROR', message: error.message },
        });
      }
    }
  }

  async getSales(req: AuthenticatedRequest, res: Response) {
    try {
      const { start, end } = req.query;
      const outletId = req.user!.outletId;

      const sales = await this.salesService.getSalesByRange(
        outletId,
        String(start),
        String(end)
      );

      res.status(200).json({ success: true, data: sales });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      });
    }
  }
}
