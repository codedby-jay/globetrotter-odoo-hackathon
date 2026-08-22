import { Clock3, Plus } from "lucide-react";
import { categoryLabel, formatDuration, formatMoney } from "../../lib/dates.js";
import { photoForQuery } from "../../lib/travelArt.js";
import Button from "../../ui/Button.jsx";
import CoverImage from "../../components/CoverImage.jsx";

export default function ActivityResultCard({
  activity,
  currency = "USD",
  onAdd,
  actionLabel = "Add activity",
}) {
  return (
    <article className="gt-card gt-card-hover overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row">
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt=""
            className="h-36 w-full object-cover sm:h-auto sm:w-44"
          />
        ) : (
          <CoverImage
            src={photoForQuery(`${activity.name} ${activity.type || ""}`, "city")}
            alt=""
            className="h-36 w-full object-cover sm:h-auto sm:w-44"
          />
        )}
        <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="gt-eyebrow">{categoryLabel(activity.type)}</p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{activity.name}</h3>
            {activity.description ? (
              <p className="mt-1 text-sm text-muted">{activity.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="font-medium">{formatMoney(activity.typicalCost ?? 0, currency)}</span>
              {formatDuration(activity.durationMin) ? (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock3 size={14} />
                  {formatDuration(activity.durationMin)}
                </span>
              ) : null}
            </div>
          </div>
          <Button variant="coral" className="self-start" onClick={() => onAdd?.(activity)}>
            <Plus size={14} />
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
