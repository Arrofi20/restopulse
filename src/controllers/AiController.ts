import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AiService } from '../services/AiService';
import { z } from 'zod';

const aiSummaryRequestSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
});

export class AiController {
  private aiService: AiService;

  constructor(aiService?: AiService) {
    this.aiService = aiService ?? new AiService();
  }

  static getInstance(): AiController {
    return new AiController();
  }

  async generateSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = aiSummaryRequestSchema.parse(req.body);
      const outletId = req.user!.outletId;

      const dateStart =
        parsed.start ||
        new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const dateEnd =
        parsed.end || new Date().toISOString().slice(0, 10);

      if (dateStart > dateEnd) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Start date must be before or equal to end date',
          },
        });
        return;
      }

      const result = await this.aiService.generateSummaryDeduplicated(
        outletId,
        dateStart,
        dateEnd
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
          error: {
            code: 'AI_ERROR',
            message:
              error.message ||
              'Terjadi kesalahan saat memproses ringkasan AI. Dashboard tetap berfungsi normal.',
          },
        });
      }
    }
  }
}
