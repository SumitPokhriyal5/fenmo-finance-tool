import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
