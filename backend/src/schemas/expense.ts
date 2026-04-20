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
