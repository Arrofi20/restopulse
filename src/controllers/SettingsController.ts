import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SettingsService } from '../services/SettingsService';

export class SettingsController {
  private settingsService: SettingsService;

  constructor(settingsService?: SettingsService) {
    this.settingsService = settingsService ?? new SettingsService();
  }

  static getInstance(): SettingsController {
    return new SettingsController();
  }

  async getGeminiConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const config = await this.settingsService.getGeminiConfig(outletId);

      res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SETTINGS_ERROR', message: error.message },
      });
    }
  }

  async saveGeminiKey(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'API key is required' },
        });
        return;
      }

      await this.settingsService.saveGeminiKey(outletId, apiKey);

      res.status(200).json({
        success: true,
        data: { message: 'API key saved successfully' },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'SETTINGS_ERROR', message: error.message },
      });
    }
  }

  async saveGeminiModel(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const { model } = req.body;

      if (!model || typeof model !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Model is required' },
        });
        return;
      }

      await this.settingsService.saveGeminiModel(outletId, model);

      res.status(200).json({
        success: true,
        data: { message: 'Model saved successfully' },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'SETTINGS_ERROR', message: error.message },
      });
    }
  }

  async deleteGeminiKey(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      await this.settingsService.deleteGeminiKey(outletId);

      res.status(200).json({
        success: true,
        data: { message: 'API key deleted. Falling back to .env configuration if available.' },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SETTINGS_ERROR', message: error.message },
      });
    }
  }

  async testConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const outletId = req.user!.outletId;
      const result = await this.settingsService.testConnection(outletId);

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SETTINGS_ERROR', message: error.message },
      });
    }
  }

  async getModels(_req: AuthenticatedRequest, res: Response) {
    res.status(200).json({
      success: true,
      data: this.settingsService.getAvailableModels(),
    });
  }
}
