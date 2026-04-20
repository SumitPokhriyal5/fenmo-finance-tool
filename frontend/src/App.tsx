import { useCallback, useEffect, useState } from "react";
import { listExpenses, ApiError } from "./lib/api";
import type { Expense, SortOrder } from "./types";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTotal } from "./components/ExpenseTotal";
import { ExpenseListSkeleton } from "./components/ExpenseListSkeleton";
import { ErrorBanner } from "./components/ErrorBanner";

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

  const refreshCategories = useCallback(async () => {
    try {
      const all = await listExpenses();
      const unique = Array.from(new Set(all.map((e) => e.category))).sort();
      setCategories(unique);
    } catch {
      /* categories are a nice-to-have; silent fail is fine */
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

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

        <div className="mt-4 space-y-4">
          {loading && <ExpenseListSkeleton />}

          {!loading && error && (
            <ErrorBanner message={error} onRetry={fetchExpenses} />
          )}

          {!loading && !error && (
            <>
              <ExpenseList expenses={expenses} />
              {expenses.length > 0 && <ExpenseTotal expenses={expenses} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
