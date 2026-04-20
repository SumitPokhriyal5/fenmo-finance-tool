import type { SortOrder } from "../types";

type Props = {
  categories: string[];
  category: string;
  sort: SortOrder;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

export function ExpenseFilters({
  categories,
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label
          htmlFor="filter-category"
          className="block text-xs font-medium uppercase tracking-wide text-gray-500"
        >
          Category
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`mt-1 ${selectClass}`}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-sort"
          className="block text-xs font-medium uppercase tracking-wide text-gray-500"
        >
          Sort by date
        </label>
        <select
          id="filter-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className={`mt-1 ${selectClass}`}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </div>
    </div>
  );
}
