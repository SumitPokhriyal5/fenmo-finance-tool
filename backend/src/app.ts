import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import expenseRoutes from "./routes/expenses";
import { errorHandler } from "./middleware/errorHandler";

type AppOptions = {
  corsOrigin?: string;
  enableLogging?: boolean;
};

export function createApp(options: AppOptions = {}) {
  const app = express();

  app.use(
    cors({
      origin: options.corsOrigin,
      allowedHeaders: ["Content-Type", "Idempotency-Key"],
    })
  );
  app.use(express.json({ limit: "100kb" }));

  if (options.enableLogging) {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({
      status: dbReady ? "ok" : "degraded",
      db: dbReady ? "connected" : "disconnected",
    });
  });

  app.use("/expenses", expenseRoutes);

  app.use((req: Request, res: Response, _next: NextFunction) => {
    res
      .status(404)
      .json({ error: `Route not found: ${req.method} ${req.path}` });
  });

  app.use(errorHandler);

  return app;
}
