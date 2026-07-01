import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CateringService } from '../services/CateringService';
import { ZodError } from 'zod';
import { cateringQuerySchema } from '../validation/dataManagement.schema';

export class CateringController {
  private cateringService: CateringService;

  constructor(cateringService?: CateringService) {
    this.cateringService = cateringService ?? new CateringService();
  }

  static getInstance(): CateringController {
    return new CateringController();
  }

  async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { client_name, order_date, total_amount, status, notes } = req.body;
      const outletId = req.user!.outletId;
      const userId = req.user!.userId;

      const order = await this.cateringService.createCateringOrder({
        client_name,
        order_date,
        total_amount: Number(total_amount),
        status: status || 'PENDING',
        notes: notes ?? null,
        outlet_id: outletId,
        actor_id: userId,
      });

      res.status(201).json({ success: true, data: order });
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
          error: { code: 'CATERING_ERROR', message: error.message },
        });
      }
    }
  }

  async getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const { from, to, status } = cateringQuerySchema.parse(req.query);
      const search = req.query.search as string | undefined;
      const outletId = req.user!.outletId;

      const orders = await this.cateringService.getCateringOrders(
        outletId,
        from,
        to,
        status,
        search
      );

      res.status(200).json({ success: true, data: orders });
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

  async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const order = await this.cateringService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Catering order not found' },
        });
        return;
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      });
    }
  }

  async updateOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const { client_name, order_date, total_amount, status, notes } = req.body;
      const userId = req.user!.userId;

      const updateData: Partial<{
        client_name: string;
        order_date: string;
        total_amount: number;
        status: string;
        notes: string | null;
      }> = {};

      if (client_name !== undefined) updateData.client_name = client_name;
      if (order_date !== undefined) updateData.order_date = order_date;
      if (total_amount !== undefined) updateData.total_amount = Number(total_amount);
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const updated = await this.cateringService.updateOrder(
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
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'CATERING_ERROR', message: error.message },
        });
      }
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const userId = req.user!.userId;

      const updated = await this.cateringService.updateStatus(
        id,
        status,
        userId
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'CATERING_ERROR', message: error.message },
      });
    }
  }

  async deleteOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;

      await this.cateringService.deleteOrder(id, userId);

      res.status(200).json({
        success: true,
        data: { message: 'Catering order deleted successfully' },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      });
    }
  }

  async getStatuses(_req: AuthenticatedRequest, res: Response) {
    res.status(200).json({
      success: true,
      data: this.cateringService.getStatuses(),
    });
  }
}
