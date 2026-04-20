import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Expense } from "../types";
import { spendingByDay, last14Days } from "../lib/stats";
import { formatRupees } from "../lib/format";

type Props = {
  expenses: Expense[];
};

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function SpendingChart({ expenses }: Props) {
  const data = last14Days(spendingByDay(expenses));
  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-zinc-300">
        Spending · last 14 days
      </h3>

      {hasData ? (
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 10, fill: "#52525b" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#52525b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 100)}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fafafa" }}
                formatter={(value) => formatRupees(Number(value))}
                labelFormatter={(label) => formatDayLabel(String(label))}
              />
              <Bar
                dataKey="amount"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center">
          <p className="text-sm text-zinc-500">
            No spending in the last 14 days
          </p>
        </div>
      )}
    </div>
  );
}
