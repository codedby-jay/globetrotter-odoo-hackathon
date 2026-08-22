import { MapPin, Plus } from "lucide-react";

export default function CityResultCard({
  city,
  actionLabel = "Add to trip",
  onAdd,
  warning,
  hint,
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="flex items-center gap-2 font-semibold">
          <MapPin size={16} className="text-teal" />
          {city.name}
        </p>
        <p className="mt-1 text-sm text-muted">
          {[city.region, city.country].filter(Boolean).join(", ")}
        </p>
        {city.lat != null && city.lng != null ? (
          <p className="mt-1 text-xs text-muted">
            {Number(city.lat).toFixed(4)}, {Number(city.lng).toFixed(4)}
          </p>
        ) : null}
        {warning ? <p className="mt-1 text-xs text-coral">{warning}</p> : null}
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-1 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        onClick={() => onAdd?.(city)}
      >
        <Plus size={14} />
        {actionLabel}
      </button>
    </article>
  );
}
