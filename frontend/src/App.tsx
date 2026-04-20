import { useCallback, useEffect, useState } from "react";
import { listExpenses, ApiError } from "./lib/api";
import type { Expense, SortOrder } from "./types";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTotal } from "./components/ExpenseTotal";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<SortOrder>("date_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listExpenses({
        category: categoryFilter || undefined,
        sort,
      });
      setExpenses(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load expenses";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, sort]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    let cancelled = false;
    listExpenses()
      .then((all) => {
        if (cancelled) return;
        const unique = Array.from(new Set(all.map((e) => e.category))).sort();
        setCategories(unique);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreated = (expense: Expense) => {
    setExpenses((prev) => {
      if (categoryFilter && expense.category !== categoryFilter) {
        return prev;
      }
      return sort === "date_desc" ? [expense, ...prev] : [...prev, expense];
    });
    setCategories((prev) =>
      prev.includes(expense.category)
        ? prev
        : [...prev, expense.category].sort()
    );
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Expense Tracker</h1>

      <div className="mt-8">
        <ExpenseForm onCreated={handleCreated} />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <ExpenseFilters
            categories={categories}
            category={categoryFilter}
            sort={sort}
            onCategoryChange={setCategoryFilter}
            onSortChange={setSort}
          />
        </div>

        {loading && <p className="mt-4 text-gray-500">Loading…</p>}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-4 space-y-4">
            <ExpenseList expenses={expenses} />
            {expenses.length > 0 && <ExpenseTotal expenses={expenses} />}
          </div>
        )}
      </div>
    </main>
  );
}
