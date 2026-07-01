import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = SettingsController.getInstance();

router.get(
  '/gemini',
  authMiddleware,
  controller.getGeminiConfig.bind(controller)
);

router.post(
  '/gemini',
  authMiddleware,
  controller.saveGeminiKey.bind(controller)
);

router.post(
  '/gemini/model',
  authMiddleware,
  controller.saveGeminiModel.bind(controller)
);

router.delete(
  '/gemini',
  authMiddleware,
  controller.deleteGeminiKey.bind(controller)
);

router.post(
  '/gemini/test',
  authMiddleware,
  controller.testConnection.bind(controller)
);

router.get(
  '/gemini/models',
  authMiddleware,
  controller.getModels.bind(controller)
);

export default router;
