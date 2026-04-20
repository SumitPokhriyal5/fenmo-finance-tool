import { categoryColor } from "../lib/categoryColor";

type Props = {
  category: string;
};

export function CategoryPill({ category }: Props) {
  const color = categoryColor(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color.bg} ${color.text} ${color.border}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color.dot }}
      />
      {category}
    </span>
  );
}
