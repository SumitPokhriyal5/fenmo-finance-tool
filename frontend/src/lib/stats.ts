import type { Expense } from "../types";

export function computeStats(expenses: Expense[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;

  const now = new Date();
  const thisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }

  let topCategory = "—";
  let topAmount = 0;
  for (const [cat, amount] of byCategory) {
    if (amount > topAmount) {
      topAmount = amount;
      topCategory = cat;
    }
  }

  return { total, count, thisMonth, topCategory };
}

export function categoryTotals(expenses: Expense[]) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(map, ([category, amount]) => ({ category, amount }));
}

export function spendingByDay(expenses: Expense[]) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const day = e.date.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + e.amount);
  }
  return Array.from(map, ([date, amount]) => ({ date, amount })).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function last14Days(data: { date: string; amount: number }[]) {
  const map = new Map(data.map((d) => [d.date, d.amount]));
  const out: { date: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, amount: map.get(key) ?? 0 });
  }
  return out;
}
