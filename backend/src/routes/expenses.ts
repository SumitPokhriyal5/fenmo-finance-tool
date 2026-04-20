import { Router } from "express";
import { createExpense, listExpenses } from "../controllers/expenses";
import { validateBody, validateQuery } from "../middleware/validate";
import { requireIdempotencyKey } from "../middleware/idempotency";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
} from "../schemas/expense";

const router = Router();

router.post(
  "/",
  requireIdempotencyKey,
  validateBody(createExpenseSchema),
  createExpense
);

router.get("/", validateQuery(listExpensesQuerySchema), listExpenses);

export default router;
