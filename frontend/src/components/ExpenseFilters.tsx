import type { SortOrder } from "../types";

type Props = {
  categories: string[];
  category: string;
  sort: SortOrder;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
};

const selectClass =
  "rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15";

export function ExpenseFilters({
  categories,
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOrder)}
        className={selectClass}
      >
        <option value="date_desc">Newest first</option>
        <option value="date_asc">Oldest first</option>
      </select>
    </div>
  );
}
