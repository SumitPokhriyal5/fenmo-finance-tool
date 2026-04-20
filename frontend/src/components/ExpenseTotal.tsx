import { formatRupees } from "../lib/format";

type Props = {
  expenses: { amount: number }[];
};

export function ExpenseTotal({ expenses }: Props) {
  const totalPaise = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;

  return (
    <div className="flex items-baseline justify-between rounded-md bg-gray-900 px-4 py-3 text-white">
      <span className="text-sm text-gray-300">
        {count} {count === 1 ? "expense" : "expenses"}
      </span>
      <span className="text-lg font-semibold tabular-nums">
        Total: {formatRupees(totalPaise)}
      </span>
    </div>
  );
}
