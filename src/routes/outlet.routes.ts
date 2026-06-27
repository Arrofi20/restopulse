import { Router } from 'express';
import { OutletController } from '../controllers/OutletController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const outletController = OutletController.getInstance();

router.get('/', authMiddleware, outletController.getOutlet.bind(outletController));
router.patch('/', authMiddleware, outletController.updateOutlet.bind(outletController));

export default router;
