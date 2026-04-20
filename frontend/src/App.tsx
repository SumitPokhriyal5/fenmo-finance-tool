import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Receipt, CalendarClock, TrendingUp } from "lucide-react";
import { listExpenses, ApiError } from "./lib/api";
import { formatRupees } from "./lib/format";
import { computeStats } from "./lib/stats";
import type { Expense, SortOrder } from "./types";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseListSkeleton } from "./components/ExpenseListSkeleton";
import { ErrorBanner } from "./components/ErrorBanner";
import { StatCard } from "./components/StatCard";
import { CategoryBreakdownChart } from "./components/CategoryBreakdownChart";
import { SpendingChart } from "./components/SpendingChart";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
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

  const refreshAll = useCallback(async () => {
    try {
      const all = await listExpenses();
      setAllExpenses(all);
    } catch {
      /* silent fail — stats are best-effort */
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const categories = useMemo(
    () => Array.from(new Set(allExpenses.map((e) => e.category))).sort(),
    [allExpenses]
  );

  const stats = useMemo(() => computeStats(allExpenses), [allExpenses]);

  const handleCreated = (expense: Expense) => {
    setAllExpenses((prev) => [expense, ...prev]);
    setExpenses((prev) => {
      if (categoryFilter && expense.category !== categoryFilter) return prev;
      return sort === "date_desc" ? [expense, ...prev] : [...prev, expense];
    });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">
              Expense Tracker
            </h1>
            <p className="text-xs text-zinc-500">Track where your money goes</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total spent"
            value={formatRupees(stats.total)}
            icon={Wallet}
            accent="indigo"
          />
          <StatCard
            label="This month"
            value={formatRupees(stats.thisMonth)}
            icon={CalendarClock}
            accent="violet"
          />
          <StatCard
            label="Top category"
            value={stats.topCategory}
            icon={TrendingUp}
            accent="emerald"
          />
          <StatCard
            label="Expenses"
            value={String(stats.count)}
            icon={Receipt}
            accent="amber"
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <SpendingChart expenses={allExpenses} />
          <CategoryBreakdownChart expenses={allExpenses} />
        </section>

        <section className="mt-6">
          <ExpenseForm onCreated={handleCreated} />
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Expenses</h2>
            <ExpenseFilters
              categories={categories}
              category={categoryFilter}
              sort={sort}
              onCategoryChange={setCategoryFilter}
              onSortChange={setSort}
            />
          </div>

          <div className="mt-4">
            {loading && <ExpenseListSkeleton />}
            {!loading && error && (
              <ErrorBanner message={error} onRetry={fetchExpenses} />
            )}
            {!loading && !error && <ExpenseList expenses={expenses} />}
          </div>
        </section>
      </main>
    </div>
  );
}
