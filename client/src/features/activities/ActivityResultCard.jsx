import { Clock3, Plus, Tag } from "lucide-react";
import { categoryLabel, formatDuration, formatMoney } from "../../lib/dates.js";

export default function ActivityResultCard({
  activity,
  currency = "USD",
  onAdd,
  actionLabel = "Add to itinerary",
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt=""
            className="h-36 w-full object-cover sm:h-auto sm:w-40"
          />
        ) : (
          <div className="flex h-24 items-center justify-center bg-cream text-teal sm:h-auto sm:w-24">
            <Tag size={22} />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {categoryLabel(activity.type)}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{activity.name}</h3>
            {activity.description ? (
              <p className="mt-1 text-sm text-muted">{activity.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span>{formatMoney(activity.typicalCost ?? 0, currency)}</span>
              {formatDuration(activity.durationMin) ? (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock3 size={14} />
                  {formatDuration(activity.durationMin)}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 self-start rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            onClick={() => onAdd?.(activity)}
          >
            <Plus size={14} />
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
