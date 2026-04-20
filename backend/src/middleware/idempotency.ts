import { Request, Response, NextFunction } from "express";
import { IdempotencyKeyModel } from "../models/IdempotencyKey";

declare module "express-serve-static-core" {
  interface Request {
    idempotencyKey?: string;
  }
}

export async function requireIdempotencyKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.header("Idempotency-Key");

  if (!key) {
    return res
      .status(400)
      .json({ error: "Idempotency-Key header is required" });
  }

  if (key.length > 200) {
    return res.status(400).json({ error: "Idempotency-Key too long" });
  }

  const existing = await IdempotencyKeyModel.findOne({ key }).lean();
  if (existing) {
    return res.status(existing.statusCode).json(existing.response);
  }

  req.idempotencyKey = key;
  next();
}
