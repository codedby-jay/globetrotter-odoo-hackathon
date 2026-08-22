import { Pencil, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import { formatCurrency, formatDate } from "../../lib/dates.js";
import { CATEGORY_META } from "./BudgetSummary.jsx";
import Button from "../../ui/Button.jsx";

export default function ExpenseList({
  expenses,
  currency,
  onAdd,
  onEdit,
  onDelete,
  emptyLabel = "Track flights, lodging, meals, and more against this trip’s budget.",
}) {
  if (!expenses?.length) {
    return (
      <EmptyState
        title="No expenses recorded yet."
        description={emptyLabel}
        action={
          onAdd ? (
            <Button variant="coral" onClick={onAdd}>
              Add expense
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="gt-card divide-y divide-line overflow-hidden">
      {expenses.map((expense) => {
        const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
        const Icon = meta.icon;
        const description = expense.description || expense.label;
        const date = expense.expenseDate || expense.incurredOn;
        return (
          <article
            key={expense.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
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
              <p className="mr-2 font-display text-lg font-semibold">
                {formatCurrency(expense.amount, expense.currency || currency)}
              </p>
              <Button variant="secondary" size="sm" onClick={() => onEdit?.(expense)}>
                <Pencil size={14} />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(expense)}>
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
