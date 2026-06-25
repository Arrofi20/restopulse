import { Router } from 'express';
import { DummyController } from '../controllers/DummyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const dummyController = DummyController.getInstance();

router.post(
  '/dummy-inject',
  authMiddleware,
  dummyController.injectDummyData.bind(dummyController)
);

export default router;
