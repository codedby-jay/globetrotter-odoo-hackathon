import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, MapPin, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import ActivityCard from "../activities/ActivityCard.jsx";
import { formatDateRange, formatMoney, tripLengthLabel } from "../../lib/dates.js";
import { cityCoverSrc } from "../../lib/travelArt.js";
import Button from "../../ui/Button.jsx";
import CoverImage from "../../components/CoverImage.jsx";

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
  const stay = formatMoney(stop.stayCost ?? 0, currency);
  const transport = formatMoney(stop.transportCost ?? 0, currency);

  return (
    <article className="gt-card overflow-hidden">
      <div className="relative h-28 bg-navy sm:h-36">
        <CoverImage
          src={cityCoverSrc(stop.city)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/75">
            Destination {number}
          </p>
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {stop.city?.name || "Unknown city"}
          </h3>
        </div>
      </div>
      <div className="p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-muted">
            <MapPin size={16} className="text-teal" />
            {[stop.city?.country].filter(Boolean).join(", ")}
            {stop.city?.region ? ` · ${stop.city.region}` : ""}
          </p>
          <p className="mt-2 text-sm">
            {formatDateRange(stop.startDate, stop.endDate)}
            <span className="text-muted">
              {" "}
              · {tripLengthLabel(stop.startDate, stop.endDate)}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span>Stay {stay}</span>
            <span>Transport {transport}</span>
            <span>
              {activities.length} {activities.length === 1 ? "activity" : "activities"}
            </span>
          </div>
        </div>
        {readOnly ? null : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onMoveUp} disabled={isFirst || reordering}>
              <ArrowUp size={14} />
              Up
            </Button>
            <Button variant="secondary" size="sm" onClick={onMoveDown} disabled={isLast || reordering}>
              <ArrowDown size={14} />
              Down
            </Button>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="mb-3 text-sm font-semibold">Activities</h4>
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
            <Sparkles className="mx-auto mb-2 text-teal" size={20} />
            <p className="font-medium">Your itinerary is waiting for something exciting.</p>
            <p className="mt-1 text-sm text-muted">No activities planned yet.</p>
            {readOnly ? null : (
              <Button
                variant="coral"
                size="sm"
                className="mt-4"
                to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
              >
                <Plus size={16} />
                Add activity
              </Button>
            )}
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
        {readOnly || activities.length === 0 ? null : (
          <Link
            to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
            className="gt-btn gt-btn-coral mt-4"
          >
            <Plus size={16} />
            Add activity
          </Link>
        )}
      </div>
      </div>
    </article>
  );
}
