import { config } from "../config";
import type { Expense, CreateExpenseInput, ListExpensesParams } from "../types";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await parseJsonSafely(res);

  if (!res.ok) {
    const message =
      (body as { error?: string })?.error ?? `Request failed (${res.status})`;
    const details = (body as { details?: unknown })?.details;
    throw new ApiError(res.status, message, details);
  }

  return body as T;
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export async function listExpenses(
  params: ListExpensesParams = {}
): Promise<Expense[]> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  const url = `${config.apiUrl}/expenses${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  return handleResponse<Expense[]>(res);
}

export async function createExpense(
  input: CreateExpenseInput,
  idempotencyKey: string
): Promise<Expense> {
  const res = await fetch(`${config.apiUrl}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });
  return handleResponse<Expense>(res);
}
