import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./config/db";
import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

async function start() {
  await connectDB(MONGO_URI!);

  const app = createApp({
    corsOrigin: process.env.CORS_ORIGIN,
    enableLogging: true,
  });

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
