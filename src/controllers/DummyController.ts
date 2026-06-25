import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DummyService } from '../services/DummyService';
import {
  DailySalesRepository,
  SalesTrendRepository,
} from '../repositories';

export class DummyController {
  private dummyService: DummyService;

  constructor(dummyService: DummyService) {
    this.dummyService = dummyService;
  }

  static getInstance(): DummyController {
    return new DummyController(
      new DummyService(new DailySalesRepository(), new SalesTrendRepository())
    );
  }

  async injectDummyData(req: AuthenticatedRequest, res: Response) {
    try {
      const { days, confirm } = req.body;
      const outletId = req.user!.outletId;

      const result = await this.dummyService.injectDummyData(
        outletId,
        Number(days) || 365,
        confirm
      );

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'INJECTION_ERROR', message: error.message },
      });
    }
  }
}
