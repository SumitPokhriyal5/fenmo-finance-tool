import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type Source = "body" | "query";

function validateSource<T>(schema: ZodSchema<T>, source: Source) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    if (source === "body") {
      req.body = result.data;
    } else {
      (req as Request & { validatedQuery: T }).validatedQuery = result.data;
    }
    next();
  };
}

export const validateBody = <T>(schema: ZodSchema<T>) =>
  validateSource(schema, "body");

export const validateQuery = <T>(schema: ZodSchema<T>) =>
  validateSource(schema, "query");
