import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Expense } from "../types";
import { categoryTotals } from "../lib/stats";
import { categoryColor } from "../lib/categoryColor";
import { formatRupees } from "../lib/format";

type Props = {
  expenses: Expense[];
};

export function CategoryBreakdownChart({ expenses }: Props) {
  const data = categoryTotals(expenses).sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-zinc-300">By category</h3>

      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center">
          <p className="text-sm text-zinc-500">No data yet</p>
        </div>
      ) : (
        <>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={categoryColor(entry.category).dot}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fafafa" }}
                  formatter={(value: number) => formatRupees(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2">
            {data.slice(0, 4).map((d) => (
              <div
                key={d.category}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: categoryColor(d.category).dot }}
                  />
                  <span className="text-zinc-400">{d.category}</span>
                </div>
                <span className="tabular-nums text-zinc-200">
                  {formatRupees(d.amount)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
