import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const expenseController = ExpenseController.getInstance();

router.post(
  '/',
  authMiddleware,
  expenseController.createExpense.bind(expenseController)
);
router.get(
  '/',
  authMiddleware,
  expenseController.getExpenses.bind(expenseController)
);
router.get(
  '/categories',
  authMiddleware,
  expenseController.getCategories.bind(expenseController)
);
router.get(
  '/:id',
  authMiddleware,
  expenseController.getExpenseById.bind(expenseController)
);
router.put(
  '/:id',
  authMiddleware,
  expenseController.updateExpense.bind(expenseController)
);
router.delete(
  '/:id',
  authMiddleware,
  expenseController.deleteExpense.bind(expenseController)
);

export default router;
