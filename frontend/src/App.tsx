import { useEffect, useState } from "react";
import { listExpenses, ApiError } from "./lib/api";
import type { Expense } from "./types";
import { ExpenseList } from "./components/ExpenseList";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listExpenses();
        if (!cancelled) setExpenses(data);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load expenses";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Expense Tracker</h1>

      {loading && <p className="mt-6 text-gray-500">Loading…</p>}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-6">
          <ExpenseList expenses={expenses} />
        </div>
      )}
    </main>
  );
}
