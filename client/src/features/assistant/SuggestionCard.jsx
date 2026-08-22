import { formatCurrency } from "../../lib/dates.js";

export default function SuggestionCard({ item, currency = "USD" }) {
  const costKnown = item.estimatedCost != null && item.estimatedCost !== "";
  return (
    <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <h3 className="font-semibold">{item.title}</h3>
      {item.city ? <p className="text-xs font-semibold uppercase tracking-wide text-teal">{item.city}</p> : null}
      <p className="mt-2 text-sm text-muted">{item.reason}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span>
          {costKnown
            ? `Estimated cost: ${formatCurrency(item.estimatedCost, currency)}`
            : "I don't have enough information to estimate that."}
        </span>
        {item.suggestedDate ? <span>Suggested: {item.suggestedDate}</span> : null}
      </div>
    </article>
  );
}
