import { Request, Response, NextFunction } from "express";
import { ExpenseModel } from "../models/Expense";
import { IdempotencyKeyModel } from "../models/IdempotencyKey";

const DUPLICATE_KEY_ERROR = 11000;

export async function createExpense(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const expense = await ExpenseModel.create(req.body);
    const response = expense.toJSON();

    try {
      await IdempotencyKeyModel.create({
        key: req.idempotencyKey,
        statusCode: 201,
        response,
      });
    } catch (err: unknown) {
      if (isDuplicateKeyError(err)) {
        await expense.deleteOne();
        const cached = await IdempotencyKeyModel.findOne({
          key: req.idempotencyKey,
        }).lean();
        if (cached) {
          return res.status(cached.statusCode).json(cached.response);
        }
      }
      throw err;
    }

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === DUPLICATE_KEY_ERROR
  );
}
