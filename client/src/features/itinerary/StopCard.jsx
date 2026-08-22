import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, MapPin, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import ActivityCard from "../activities/ActivityCard.jsx";
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
  tripId,
  currency,
  onEditActivity,
  onDeleteActivity,
  onMoveActivity,
  activityReordering,
}) {
  const number = String(index + 1).padStart(2, "0");
  const activities = stop.activities || [];

  return (
    <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            Destination
          </p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-teal">{number}</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold">
            <MapPin size={18} className="text-teal" />
            {stop.city?.name || "Unknown city"}
          </h3>
          <p className="text-sm text-muted">
            {[stop.city?.country].filter(Boolean).join(", ")}
            {stop.city?.region ? ` · ${stop.city.region}` : ""}
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

      <div className="mt-5 border-t border-sand pt-4">
        <h4 className="mb-3 text-sm font-semibold">Activities</h4>
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand px-4 py-6 text-center">
            <Sparkles className="mx-auto mb-2 text-teal" size={20} />
            <p className="text-sm text-muted">No activities yet for this destination.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((item, activityIndex) => (
              <ActivityCard
                key={item.id}
                item={item}
                currency={currency}
                isFirst={activityIndex === 0}
                isLast={activityIndex === activities.length - 1}
                readOnly={readOnly}
                reordering={activityReordering}
                onEdit={() => onEditActivity?.(stop, item)}
                onDelete={() => onDeleteActivity?.(stop, item)}
                onMoveUp={() => onMoveActivity?.(stop, activityIndex, -1)}
                onMoveDown={() => onMoveActivity?.(stop, activityIndex, 1)}
              />
            ))}
          </div>
        )}
        {readOnly ? null : (
          <Link
            to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} />
            Add Activity
          </Link>
        )}
      </div>
    </article>
  );
}
