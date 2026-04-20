import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./config/db";
import expenseRoutes from "./routes/expenses";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ["Content-Type", "Idempotency-Key"],
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "ok" : "degraded",
    db: dbReady ? "connected" : "disconnected",
  });
});

app.use("/expenses", expenseRoutes);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

async function start() {
  await connectDB(MONGO_URI!);

  const server = app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
  });
}

start();
