import { Router } from 'express';
import { AiController } from '../controllers/AiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const aiController = AiController.getInstance();

router.post(
  '/summary',
  authMiddleware,
  aiController.generateSummary.bind(aiController)
);

export default router;
