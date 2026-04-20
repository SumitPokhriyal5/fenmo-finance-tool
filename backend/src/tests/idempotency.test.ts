import request from "supertest";
import { createApp } from "../app";
import { ExpenseModel } from "../models/Expense";
import { connectTestDb, disconnectTestDb, clearDb } from "./setup";

const app = createApp();

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearDb);

describe("POST /expenses idempotency", () => {
  const payload = {
    amount: 1250,
    category: "Food",
    description: "Lunch",
    date: "2026-04-20",
  };

  it("returns 400 when Idempotency-Key header is missing", async () => {
    const res = await request(app).post("/expenses").send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/idempotency-key/i);
  });

  it("creates exactly one expense when the same key is used twice", async () => {
    const key = "test-key-abc-123";

    const first = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", key)
      .send(payload);

    const second = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", key)
      .send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);

    const count = await ExpenseModel.countDocuments();
    expect(count).toBe(1);
  });

  it("creates two expenses when different keys are used", async () => {
    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "key-1")
      .send(payload);

    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "key-2")
      .send(payload);

    const count = await ExpenseModel.countDocuments();
    expect(count).toBe(2);
  });

  it("rejects invalid amount with 400 and does not cache the response", async () => {
    const res = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "validation-key")
      .send({ ...payload, amount: -5 });

    expect(res.status).toBe(400);

    const retry = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "validation-key")
      .send(payload);

    expect(retry.status).toBe(201);
    expect(await ExpenseModel.countDocuments()).toBe(1);
  });
});
