import type { Expense } from "../types";
import { formatRupees, formatDate } from "../lib/format";
import { CategoryPill } from "./CategoryPill";

type Props = {
  expenses: Expense[];
};

export function ExpenseList({ expenses }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
          <svg
            className="h-6 w-6 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-zinc-300">
          No expenses yet
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Add your first expense to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="border-b border-white/5 bg-zinc-900/60">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Date
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Category
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Description
            </th>
            <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {expenses.map((e, i) => (
            <tr
              key={e.id}
              className="animate-fade-in-up transition hover:bg-white/2"
              style={{ animationDelay: `${Math.min(i * 25, 400)}ms` }}
            >
              <td className="px-5 py-3.5 text-zinc-400">
                {formatDate(e.date)}
              </td>
              <td className="px-5 py-3.5">
                <CategoryPill category={e.category} />
              </td>
              <td className="px-5 py-3.5 text-zinc-200">{e.description}</td>
              <td className="px-5 py-3.5 text-right font-medium tabular-nums text-white">
                {formatRupees(e.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
