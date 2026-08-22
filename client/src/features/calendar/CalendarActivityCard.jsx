import { Clock3, MapPin, Pencil } from "lucide-react";
import {
  activityLabel,
  categoryLabel,
  formatCurrency,
  formatDuration,
  formatTimeDisplay,
} from "../../lib/dates.js";
import Button from "../../ui/Button.jsx";

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
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="gt-eyebrow">
            {start || "Unscheduled"}
            {end ? ` – ${end}` : ""}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{name}</h3>
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
            {item.cost != null ? <span className="font-medium">{formatCurrency(item.cost, currency)}</span> : null}
          </div>
          {notes ? <p className="mt-2 text-sm text-muted">{notes}</p> : null}
        </div>
        {onEdit ? (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Pencil size={14} />
            Edit
          </Button>
        ) : null}
      </div>
    </article>
  );
}
