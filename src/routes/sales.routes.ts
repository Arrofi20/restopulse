import { Router } from 'express';
import { SalesController } from '../controllers/SalesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const salesController = SalesController.getInstance();

router.post(
  '/',
  authMiddleware,
  salesController.createSale.bind(salesController)
);
router.get('/', authMiddleware, salesController.getSales.bind(salesController));

export default router;
