import { Router } from 'express';
import { CateringController } from '../controllers/CateringController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const cateringController = CateringController.getInstance();

router.post(
  '/',
  authMiddleware,
  cateringController.createOrder.bind(cateringController)
);
router.get(
  '/',
  authMiddleware,
  cateringController.getOrders.bind(cateringController)
);
router.get(
  '/statuses',
  authMiddleware,
  cateringController.getStatuses.bind(cateringController)
);
router.get(
  '/:id',
  authMiddleware,
  cateringController.getOrderById.bind(cateringController)
);
router.put(
  '/:id',
  authMiddleware,
  cateringController.updateOrder.bind(cateringController)
);
router.patch(
  '/:id',
  authMiddleware,
  cateringController.updateStatus.bind(cateringController)
);
router.delete(
  '/:id',
  authMiddleware,
  cateringController.deleteOrder.bind(cateringController)
);

export default router;
