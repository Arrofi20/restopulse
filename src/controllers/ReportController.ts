import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ReportService } from '../services/ReportService';
import { ZodError } from 'zod';

export class ReportController {
  private reportService: ReportService;

  constructor(reportService?: ReportService) {
    this.reportService = reportService ?? new ReportService();
  }

  static getInstance(): ReportController {
    return new ReportController();
  }

  async getReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { start, end } = req.query;
      const outletId = req.user!.outletId;

      const report = await this.reportService.getReport(
        outletId,
        String(start),
        String(end)
      );

      res.status(200).json({ success: true, data: report });
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
          error: { code: 'REPORT_ERROR', message: error.message },
        });
      }
    }
  }
}