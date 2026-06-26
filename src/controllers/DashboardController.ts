import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DashboardService } from '../services/DashboardService';
import { SalesTrendRepository } from '../repositories';
import { ZodError } from 'zod';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  static getInstance(): DashboardController {
    return new DashboardController(
      new DashboardService(new SalesTrendRepository())
    );
  }

  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { start, end } = req.query;
      const outletId = req.user!.outletId;

      const dashboard = await this.dashboardService.getDashboard(
        outletId,
        String(start),
        String(end)
      );

      res.status(200).json({ success: true, data: dashboard });
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
          error: { code: 'DASHBOARD_ERROR', message: error.message },
        });
      }
    }
  }
}
