import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const reportController = ReportController.getInstance();

router.get(
  '/',
  authMiddleware,
  reportController.getReport.bind(reportController)
);

export default router;