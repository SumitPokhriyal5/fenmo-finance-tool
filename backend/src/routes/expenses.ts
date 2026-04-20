import { Router, Request, Response } from "express";
import { createExpense, listExpenses } from "../controllers/expenses";
import { validateBody, validateQuery } from "../middleware/validate";
import { requireIdempotencyKey } from "../middleware/idempotency";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
} from "../schemas/expense";

const router = Router();

router.get("/", validateQuery(listExpensesQuerySchema), listExpenses);

router.post(
  "/",
  requireIdempotencyKey,
  validateBody(createExpenseSchema),
  createExpense
);

router.all("/", (_req: Request, res: Response) => {
  res.set("Allow", "GET, POST");
  res.status(405).json({ error: "Method not allowed" });
});

export default router;
