import { useState, type FormEvent } from "react";
import { IndianRupee, Tag, FileText, Calendar, Plus } from "lucide-react";
import { createExpense, generateIdempotencyKey, ApiError } from "../lib/api";
import { rupeesToPaise } from "../lib/money";
import { todayIso } from "../lib/date";
import type { Expense } from "../types";

type Props = {
  onCreated: (expense: Expense) => void;
};

type FormState = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = {
  amount: "",
  category: "",
  description: "",
  date: todayIso(),
};

const inputBase =
  "w-full rounded-lg border bg-zinc-950/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2";

const inputClass = (hasError: boolean) =>
  hasError
    ? `${inputBase} border-rose-500/40 focus:border-rose-500/60 focus:ring-rose-500/10`
    : `${inputBase} border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/15`;

export function ExpenseForm({ onCreated }: Props) {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): { valid: boolean; paise: number | null } => {
    const errors: FieldErrors = {};
    const paise = rupeesToPaise(values.amount);

    if (paise === null)
      errors.amount = "Enter a positive amount (max 2 decimals)";
    if (!values.category.trim()) errors.category = "Required";
    if (!values.description.trim()) errors.description = "Required";
    if (!values.date) errors.date = "Required";

    setFieldErrors(errors);
    return { valid: Object.keys(errors).length === 0, paise };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const { valid, paise } = validate();
    if (!valid || paise === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createExpense(
        {
          amount: paise,
          category: values.category.trim(),
          description: values.description.trim(),
          date: values.date,
        },
        generateIdempotencyKey()
      );

      onCreated(created);
      setValues({ ...INITIAL_STATE, date: todayIso() });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-white/5 bg-zinc-900/40 p-5 backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500">
          <Plus className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-white">Add expense</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InputWithIcon
          id="amount"
          icon={IndianRupee}
          placeholder="0.00"
          value={values.amount}
          onChange={(v) => update("amount", v)}
          error={fieldErrors.amount}
          inputMode="decimal"
        />
        <InputWithIcon
          id="category"
          icon={Tag}
          placeholder="Category"
          value={values.category}
          onChange={(v) => update("category", v)}
          error={fieldErrors.category}
        />
        <InputWithIcon
          id="description"
          icon={FileText}
          placeholder="Description"
          value={values.description}
          onChange={(v) => update("description", v)}
          error={fieldErrors.description}
          className="sm:col-span-2 lg:col-span-1"
        />
        <InputWithIcon
          id="date"
          icon={Calendar}
          type="date"
          value={values.date}
          onChange={(v) => update("date", v)}
          error={fieldErrors.date}
          max={todayIso()}
        />
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-300"
        >
          {submitError}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

type InputProps = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "decimal";
  max?: string;
  className?: string;
};

function InputWithIcon({
  id,
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  max,
  className,
}: InputProps) {
  return (
    <div className={className}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={max}
          className={inputClass(Boolean(error))}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
