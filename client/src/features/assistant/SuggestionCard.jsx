import { formatCurrency } from "../../lib/dates.js";

export default function SuggestionCard({ item, currency = "USD" }) {
  const costKnown = item.estimatedCost != null && item.estimatedCost !== "";
  return (
    <article className="gt-card p-4">
      {item.city ? <p className="gt-eyebrow">{item.city}</p> : null}
      <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{item.title}</h3>
      <p className="mt-2 text-sm text-muted">{item.reason}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span>
          {costKnown
            ? `Estimated cost: ${formatCurrency(item.estimatedCost, currency)}`
            : "I don't have enough information to estimate that."}
        </span>
        {item.suggestedDate ? <span className="text-muted">Suggested: {item.suggestedDate}</span> : null}
      </div>
    </article>
  );
}
