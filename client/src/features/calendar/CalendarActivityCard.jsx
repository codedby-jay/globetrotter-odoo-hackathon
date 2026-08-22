import { Clock3, MapPin, Pencil } from "lucide-react";
import {
  activityLabel,
  categoryLabel,
  formatCurrency,
  formatDuration,
  formatTimeDisplay,
} from "../../lib/dates.js";

export default function CalendarActivityCard({
  item,
  currency = "USD",
  cityName,
  onEdit,
}) {
  const name = activityLabel(item);
  const category = categoryLabel(item.activity?.type || item.costCategory);
  const start = formatTimeDisplay(item.startTime) || item.startTime;
  const end = formatTimeDisplay(item.endTime) || item.endTime;
  const duration = formatDuration(item.durationMin);
  const notes = item.notes || item.customDescription || item.activity?.description;

  return (
    <article className="rounded-xl border border-sand bg-cream/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            {start || "Unscheduled"}
            {end ? ` – ${end}` : ""}
          </p>
          <h3 className="mt-1 text-base font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-muted">{category}</p>
          {cityName ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin size={14} className="text-teal" />
              {cityName}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {duration ? (
              <span className="inline-flex items-center gap-1 text-muted">
                <Clock3 size={14} />
                {duration}
              </span>
            ) : null}
            {item.cost != null ? <span>{formatCurrency(item.cost, currency)}</span> : null}
          </div>
          {notes ? <p className="mt-2 text-sm text-muted">{notes}</p> : null}
        </div>
        {onEdit ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 self-start rounded-lg border border-sand bg-white px-3 py-1.5 text-sm hover:bg-sand"
            onClick={onEdit}
          >
            <Pencil size={14} />
            Edit
          </button>
        ) : null}
      </div>
    </article>
  );
}
