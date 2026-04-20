import { Router } from "express";
import { createExpense } from "../controllers/expenses";
import { validate } from "../middleware/validate";
import { requireIdempotencyKey } from "../middleware/idempotency";
import { createExpenseSchema } from "../schemas/expense";

const router = Router();

router.post(
  "/",
  requireIdempotencyKey,
  validate(createExpenseSchema),
  createExpense
);

export default router;
