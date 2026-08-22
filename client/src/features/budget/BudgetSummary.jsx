import { BedDouble, Bus, CircleDollarSign, Ticket, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "../../lib/dates.js";
import StatCard from "../../ui/StatCard.jsx";

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Budget" value={formatCurrency(summary.budget, currency)} />
        <StatCard label="Spent" value={formatCurrency(summary.totalSpent, currency)} />
        <StatCard
          label="Remaining"
          value={formatCurrency(summary.remaining, currency)}
          hint={over ? "Over budget" : undefined}
        />
        <StatCard label="Used" value={`${summary.percentageUsed}%`} />
      </div>

      <div className="gt-card p-4 md:p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Budget used</span>
          <span className={over ? "font-semibold text-coral" : "font-semibold"}>{summary.percentageUsed}%</span>
        </div>
        <div className={`gt-progress ${over ? "gt-progress-over" : ""}`}>
          <span style={{ width: `${barWidth}%` }} />
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
                <div key={key} className="rounded-xl bg-cream px-3 py-2.5 text-sm">
                  <p className="flex items-center gap-1.5 text-muted">
                    <Icon size={14} className="text-teal" />
                    {meta.label}
                  </p>
                  <p className="mt-1 font-semibold">
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
