import { useState, type FormEvent } from "react";
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

    if (paise === null) {
      errors.amount = "Enter a positive amount with up to 2 decimals";
    }
    if (!values.category.trim()) {
      errors.category = "Category is required";
    }
    if (!values.description.trim()) {
      errors.description = "Description is required";
    }
    if (!values.date) {
      errors.date = "Date is required";
    }

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

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-gray-400 focus:ring-gray-100"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Add expense</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Amount (₹)" htmlFor="amount" error={fieldErrors.amount}>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={values.amount}
            onChange={(e) => update("amount", e.target.value)}
            className={inputClass(Boolean(fieldErrors.amount))}
          />
        </Field>

        <Field label="Category" htmlFor="category" error={fieldErrors.category}>
          <input
            id="category"
            type="text"
            placeholder="e.g. Food"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass(Boolean(fieldErrors.category))}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="description"
          error={fieldErrors.description}
          className="sm:col-span-2"
        >
          <input
            id="description"
            type="text"
            placeholder="What was this for?"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass(Boolean(fieldErrors.description))}
          />
        </Field>

        <Field label="Date" htmlFor="date" error={fieldErrors.date}>
          <input
            id="date"
            type="date"
            value={values.date}
            max={todayIso()}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass(Boolean(fieldErrors.date))}
          />
        </Field>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {submitError}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitting ? "Adding…" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
