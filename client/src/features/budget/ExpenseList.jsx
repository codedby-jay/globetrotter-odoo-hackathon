import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/dates.js";
import { CATEGORY_META } from "./BudgetSummary.jsx";

export default function ExpenseList({
  expenses,
  currency,
  onEdit,
  onDelete,
  emptyLabel = "No expenses yet. Add your first cost to start tracking this trip.",
}) {
  if (!expenses?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
        <p className="font-medium">No expenses yet</p>
        <p className="mt-1 text-sm text-muted">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
        const Icon = meta.icon;
        const description = expense.description || expense.label;
        const date = expense.expenseDate || expense.incurredOn;
        return (
          <article
            key={expense.id}
            className="flex flex-col gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold">{description}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Icon size={14} className="text-teal" />
                  {meta.label}
                </span>
                <span>·</span>
                <span>{formatDate(date)}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 font-semibold">
                {formatCurrency(expense.amount, expense.currency || currency)}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand"
                onClick={() => onEdit?.(expense)}
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-coral hover:bg-sand"
                onClick={() => onDelete?.(expense)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
