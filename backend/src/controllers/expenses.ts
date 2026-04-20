import { Request, Response, NextFunction } from "express";
import { IdempotencyKeyModel } from "../models/IdempotencyKey";
import { ListExpensesQuery } from "../schemas/expense";
import { ExpenseModel } from "../models/Expense";

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

export async function listExpenses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { category, sort } = (
      req as Request & {
        validatedQuery: ListExpensesQuery;
      }
    ).validatedQuery;

    const filter: { category?: string } = {};
    if (category) filter.category = category;

    const sortOrder = sort === "date_asc" ? 1 : -1;

    const query = ExpenseModel.find(filter).sort({
      date: sortOrder,
      _id: sortOrder,
    });

    if (category) {
      query.collation({ locale: "en", strength: 2 });
    }

    const docs = await query.exec();
    res.json(docs.map((d) => d.toJSON()));
  } catch (err) {
    next(err);
  }
}
