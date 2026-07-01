import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DataManagementService } from '../services/DataManagementService';
import { ZodError } from 'zod';

export class DataManagementController {
  private dataMgmtService: DataManagementService;

  constructor(dataMgmtService?: DataManagementService) {
    this.dataMgmtService = dataMgmtService ?? new DataManagementService();
  }

  static getInstance(): DataManagementController {
    return new DataManagementController();
  }

  async resetData(req: AuthenticatedRequest, res: Response) {
    try {
      const { confirm } = req.body;
      const outletId = req.user!.outletId;
      const userId = req.user!.userId;

      if (!confirm) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'Konfirmasi diperlukan untuk menghapus semua data. Set confirm: true untuk melanjutkan.',
          },
        });
        return;
      }

      const result = await this.dataMgmtService.resetData(outletId, userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Semua data berhasil direset',
          ...result,
        },
      });
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
        res.status(500).json({
          success: false,
          error: { code: 'RESET_ERROR', message: error.message },
        });
      }
    }
  }

  async simulate(req: AuthenticatedRequest, res: Response) {
    try {
      const { days, startDate, confirm } = req.body;
      const outletId = req.user!.outletId;
      const userId = req.user!.userId;

      const result = await this.dataMgmtService.simulate(
        outletId,
        userId,
        Number(days),
        startDate,
        Boolean(confirm)
      );

      if (result.conflict) {
        const conflictResult = result as { conflict: boolean; message: string };
        res.status(409).json({
          success: false,
          error: {
            code: 'SIMULATION_CONFLICT',
            message: conflictResult.message,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Data simulasi berhasil dibuat',
          ...result,
        },
      });
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
        res.status(500).json({
          success: false,
          error: { code: 'SIMULATION_ERROR', message: error.message },
        });
      }
    }
  }

  async checkSimulation(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const exists = await this.dataMgmtService.checkSimulationExists(outletId);

      res.status(200).json({
        success: true,
        data: { simulationExists: exists },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'CHECK_ERROR', message: error.message },
      });
    }
  }
}
