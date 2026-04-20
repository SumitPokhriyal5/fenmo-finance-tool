import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: "indigo" | "violet" | "emerald" | "amber";
};

const ACCENTS = {
  indigo: { gradient: "from-indigo-500/10", icon: "text-indigo-400" },
  violet: { gradient: "from-violet-500/10", icon: "text-violet-400" },
  emerald: { gradient: "from-emerald-500/10", icon: "text-emerald-400" },
  amber: { gradient: "from-amber-500/10", icon: "text-amber-400" },
};

export function StatCard({ label, value, icon: Icon, accent }: Props) {
  const a = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur transition hover:border-white/10">
      <div
        className={`absolute inset-x-0 top-0 h-px bg-linear-to-br via-transparent ${a.gradient.replace(
          "from-",
          "via-"
        )} to-transparent opacity-70`}
      />
      <div
        className={`pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br ${a.gradient} to-transparent blur-2xl`}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {label}
          </span>
          <Icon className={`h-4 w-4 ${a.icon}`} />
        </div>
        <div className="mt-3 text-2xl font-semibold tabular-nums text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
