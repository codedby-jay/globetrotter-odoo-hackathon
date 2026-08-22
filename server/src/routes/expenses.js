import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { deleteExpense, updateExpense } from "../controllers/expenseController.js";
import {
  expenseIdParamSchema,
  updateExpenseSchema,
} from "../validation/expenseSchemas.js";

const router = Router();

router.use(authMiddleware);
router.patch(
  "/:expenseId",
  validateParams(expenseIdParamSchema),
  validateBody(updateExpenseSchema),
  updateExpense,
);
router.delete("/:expenseId", validateParams(expenseIdParamSchema), deleteExpense);

export default router;
