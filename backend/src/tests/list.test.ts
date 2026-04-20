import request from "supertest";

import { connectTestDb, disconnectTestDb, clearDb } from "./setup";
import { createApp } from "../app";
import { ExpenseModel } from "../models/Expense";

const app = createApp();

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearDb);

async function seed() {
  await ExpenseModel.create([
    {
      amount: 1250,
      category: "Food",
      description: "Lunch",
      date: new Date("2026-04-18"),
    },
    {
      amount: 30000,
      category: "Food",
      description: "Dinner",
      date: new Date("2026-04-19"),
    },
    {
      amount: 50000,
      category: "Travel",
      description: "Flight",
      date: new Date("2026-04-20"),
    },
  ]);
}

describe("GET /expenses", () => {
  it("returns all expenses newest first by default", async () => {
    await seed();

    const res = await request(app).get("/expenses");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((e: { description: string }) => e.description)).toEqual(
      ["Flight", "Dinner", "Lunch"]
    );
  });

  it("filters by category case-insensitively", async () => {
    await seed();

    const res = await request(app).get("/expenses?category=food");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(
      res.body.every((e: { category: string }) => e.category === "Food")
    ).toBe(true);
  });

  it("supports sort=date_asc (oldest first)", async () => {
    await seed();

    const res = await request(app).get("/expenses?sort=date_asc");

    expect(res.status).toBe(200);
    expect(res.body.map((e: { description: string }) => e.description)).toEqual(
      ["Lunch", "Dinner", "Flight"]
    );
  });

  it("rejects invalid sort with 400", async () => {
    const res = await request(app).get("/expenses?sort=bogus");
    expect(res.status).toBe(400);
  });

  it("returns id (not _id) and no __v", async () => {
    await seed();

    const res = await request(app).get("/expenses");
    const first = res.body[0];

    expect(first).toHaveProperty("id");
    expect(first).not.toHaveProperty("_id");
    expect(first).not.toHaveProperty("__v");
  });
});
