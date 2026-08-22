import { MapPin } from "lucide-react";

export default function CityResultCard({ city, actionLabel = "+ Add to trip", onAdd, warning }) {
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
            {Number(city.lat).toFixed(2)}, {Number(city.lng).toFixed(2)}
          </p>
        ) : null}
        {warning ? <p className="mt-1 text-xs text-coral">{warning}</p> : null}
      </div>
      {onAdd ? (
        <button
          type="button"
          className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark"
          onClick={() => onAdd(city)}
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}
