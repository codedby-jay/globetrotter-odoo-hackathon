import { BedDouble, Bus, CircleDollarSign, Ticket, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "../../lib/dates.js";

export const CATEGORY_META = {
  TRANSPORT: { label: "Transport", icon: Bus },
  STAY: { label: "Stay", icon: BedDouble },
  ACTIVITY: { label: "Activity", icon: Ticket },
  MEALS: { label: "Meals", icon: UtensilsCrossed },
  OTHER: { label: "Other", icon: CircleDollarSign },
};

export default function BudgetSummary({ summary, compact = false }) {
  if (!summary) {
    return null;
  }

  const currency = summary.currency || "USD";
  const used = Math.min(Math.max(summary.percentageUsed || 0, 0), 100);
  const over = Boolean(summary.overBudget);
  const barWidth = over ? 100 : used;

  return (
    <section className="space-y-4">
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Budget</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(summary.budget, currency)}</p>
        </article>
        <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Spent</p>
          <p className="mt-2 text-xl font-semibold">{formatCurrency(summary.totalSpent, currency)}</p>
        </article>
        <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Remaining</p>
          <p className={`mt-2 text-xl font-semibold ${over ? "text-coral" : ""}`}>
            {formatCurrency(summary.remaining, currency)}
          </p>
        </article>
        <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Used</p>
          <p className="mt-2 text-xl font-semibold">{summary.percentageUsed}%</p>
        </article>
      </div>

      <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Budget used</span>
          <span className={over ? "font-medium text-coral" : "font-medium"}>{summary.percentageUsed}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-sand">
          <div
            className={`h-full rounded-full ${over ? "bg-coral" : "bg-teal"}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        {over ? (
          <p className="mt-3 text-sm font-medium text-coral">
            Budget exceeded by {formatCurrency(summary.overBy, currency)}
          </p>
        ) : null}
        {!compact && summary.categories ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <div key={key} className="rounded-xl bg-cream px-3 py-2 text-sm">
                  <p className="flex items-center gap-1.5 text-muted">
                    <Icon size={14} className="text-teal" />
                    {meta.label}
                  </p>
                  <p className="mt-1 font-medium">
                    {formatCurrency(summary.categories[key] || 0, currency)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
