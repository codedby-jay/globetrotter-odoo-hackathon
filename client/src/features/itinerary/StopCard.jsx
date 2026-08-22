import { ArrowDown, ArrowUp, MapPin, Pencil, Trash2 } from "lucide-react";
import { formatDateRange } from "../../lib/dates.js";

export default function StopCard({
  stop,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  reordering,
  readOnly,
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-teal">{number}</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold">
            <MapPin size={18} className="text-teal" />
            {stop.city?.name || "Unknown city"}
          </h3>
          <p className="text-sm text-muted">
            {[stop.city?.region, stop.city?.country].filter(Boolean).join(", ")}
          </p>
          <p className="mt-2 text-sm">
            {formatDateRange(stop.startDate, stop.endDate)}
          </p>
        </div>
        {readOnly ? null : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand disabled:opacity-40"
              onClick={onMoveUp}
              disabled={isFirst || reordering}
            >
              <ArrowUp size={14} />
              Up
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand disabled:opacity-40"
              onClick={onMoveDown}
              disabled={isLast || reordering}
            >
              <ArrowDown size={14} />
              Down
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand"
              onClick={onEdit}
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-coral hover:bg-sand"
              onClick={onDelete}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
