export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};

export type CreateExpenseInput = {
  amount: number;
  category: string;
  description: string;
  date: string;
};

export type SortOrder = "date_desc" | "date_asc";

export type ListExpensesParams = {
  category?: string;
  sort?: SortOrder;
};
