import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().int().positive(),
  category: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(500),
  date: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" })
    .transform((s) => new Date(s)),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const listExpensesQuerySchema = z.object({
  category: z.string().trim().min(1).max(50).optional(),
  sort: z.enum(["date_desc", "date_asc"]).optional().default("date_desc"),
});

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
