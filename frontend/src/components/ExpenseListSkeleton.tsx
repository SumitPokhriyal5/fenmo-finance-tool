export function ExpenseListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur">
      <div className="border-b border-white/5 bg-zinc-900/60 px-5 py-3">
        <div className="h-3 w-24 rounded bg-zinc-800" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-5 w-20 rounded-full bg-zinc-800" />
            <div className="h-3 flex-1 rounded bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
