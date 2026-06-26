import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const dashboardController = DashboardController.getInstance();

router.get(
  '/',
  authMiddleware,
  dashboardController.getDashboard.bind(dashboardController)
);

export default router;
