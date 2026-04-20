const PALETTE = [
  {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20",
    dot: "#818cf8",
  },
  {
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    border: "border-violet-500/20",
    dot: "#a78bfa",
  },
  {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    dot: "#34d399",
  },
  {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/20",
    dot: "#fbbf24",
  },
  {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/20",
    dot: "#fb7185",
  },
  {
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    border: "border-sky-500/20",
    dot: "#38bdf8",
  },
  {
    bg: "bg-teal-500/10",
    text: "text-teal-300",
    border: "border-teal-500/20",
    dot: "#2dd4bf",
  },
  {
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-300",
    border: "border-fuchsia-500/20",
    dot: "#e879f9",
  },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function categoryColor(name: string) {
  return PALETTE[hash(name.toLowerCase()) % PALETTE.length];
}
