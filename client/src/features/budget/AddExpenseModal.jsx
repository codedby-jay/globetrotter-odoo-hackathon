import { useState } from "react";
import { X } from "lucide-react";
import { CURRENCIES, Field, inputClassName } from "../../components/TripForm.jsx";
import { ApiError, explainApiError } from "../../lib/api.js";
import { fieldError, validateExpense } from "../../lib/validation.js";
import useEscapeClose from "../../hooks/useEscapeClose.js";
import { CATEGORY_META } from "./BudgetSummary.jsx";

export default function AddExpenseModal({
  trip,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("MEALS");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(trip?.currency || "USD");
  const [expenseDate, setExpenseDate] = useState(trip?.startDate || "");
  const [errors, setErrors] = useState({});

  useEscapeClose(onClose, !submitting);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const nextErrors = validateExpense({
      description,
      category,
      amount,
      currency,
      expenseDate,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        description: description.trim(),
        category,
        amount: Number(amount),
        currency,
        expenseDate,
      });
    } catch (err) {
      const details = err instanceof ApiError ? err.details : null;
      setErrors({
        description: fieldError(details, "description") || fieldError(details, "label"),
        category: fieldError(details, "category"),
        amount: fieldError(details, "amount"),
        currency: fieldError(details, "currency"),
        expenseDate: fieldError(details, "expenseDate") || fieldError(details, "incurredOn"),
        form: explainApiError(err, "Unable to save this expense"),
      });
    }
  }

  return (
    <div className="gt-modal-backdrop">
      <div className="gt-modal max-w-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Add expense</h2>
            <p className="text-sm text-muted">{trip?.name}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-sand"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={submitting} className="contents">
          <Field label="Description" error={errors.description}>
            <input
              className={inputClassName}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Dinner at restaurant"
            />
          </Field>
          <Field label="Category" error={errors.category}>
            <select
              className={inputClassName}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {Object.entries(CATEGORY_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-3">
            <Field label="Amount" error={errors.amount}>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Field>
            <Field label="Currency" error={errors.currency}>
              <select
                className={inputClassName}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Expense date" error={errors.expenseDate}>
            <input
              className={inputClassName}
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
            />
          </Field>
          {error || errors.form ? (
            <p className="mb-3 text-sm text-coral">{error || errors.form}</p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
            className="gt-btn gt-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Add Expense"}
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
