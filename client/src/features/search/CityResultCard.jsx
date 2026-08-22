import { MapPin, Plus } from "lucide-react";
import { cityCoverSrc } from "../../lib/travelArt.js";
import Button from "../../ui/Button.jsx";
import CoverImage from "../../components/CoverImage.jsx";

export default function CityResultCard({
  city,
  actionLabel = "Add to trip",
  onAdd,
  warning,
  hint,
}) {
  return (
    <article className="gt-card gt-card-hover overflow-hidden sm:flex">
      <div className="relative h-32 w-full shrink-0 sm:h-auto sm:w-44">
        <CoverImage
          src={cityCoverSrc(city)}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <MapPin size={16} className="text-teal" />
            {city.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {[city.region, city.country].filter(Boolean).join(", ")}
          </p>
          {city.lat != null && city.lng != null ? (
            <p className="mt-1 text-xs text-muted">
              {Number(city.lat).toFixed(2)}, {Number(city.lng).toFixed(2)}
            </p>
          ) : null}
          {warning ? <p className="mt-1 text-xs text-coral">{warning}</p> : null}
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        <Button variant="coral" onClick={() => onAdd?.(city)}>
          <Plus size={14} />
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
