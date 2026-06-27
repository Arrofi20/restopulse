import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';

export class OutletController {
  static getInstance(): OutletController {
    return new OutletController();
  }

  async getOutlet(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const outlet = await prisma.outlet.findUnique({
        where: { id: outletId },
      });

      if (!outlet) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Outlet not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { id: outlet.id, name: outlet.name, timezone: outlet.timezone },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      });
    }
  }

  async updateOutlet(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
        });
        return;
      }

      const trimmed = name.trim();
      if (trimmed.length > 100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name must be at most 100 characters',
          },
        });
        return;
      }

      const outlet = await prisma.outlet.update({
        where: { id: outletId },
        data: { name: trimmed },
      });

      res.status(200).json({
        success: true,
        data: { id: outlet.id, name: outlet.name, timezone: outlet.timezone },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_ERROR', message: error.message },
      });
    }
  }
}
