import { Router } from 'express';
import { DataManagementController } from '../controllers/DataManagementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const dataMgmtController = DataManagementController.getInstance();

router.post(
  '/reset-data',
  authMiddleware,
  dataMgmtController.resetData.bind(dataMgmtController)
);

router.post(
  '/simulate',
  authMiddleware,
  dataMgmtController.simulate.bind(dataMgmtController)
);

router.get(
  '/simulate/check',
  authMiddleware,
  dataMgmtController.checkSimulation.bind(dataMgmtController)
);

export default router;
