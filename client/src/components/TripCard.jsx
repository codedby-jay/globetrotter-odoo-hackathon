import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, MapPinned, Pencil, Trash2, Wallet } from "lucide-react";
import { formatDateRange, formatMoney } from "../lib/dates.js";

export default function TripCard({ trip, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = trip.coverPhotoUrl && !imageFailed;

  return (
    <article className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-36 bg-gradient-to-br from-teal to-teal-dark">
        {showImage ? (
          <img
            src={trip.coverPhotoUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-end p-4 text-white/90">
            <MapPinned size={28} />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-semibold">{trip.name}</h2>
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange size={16} />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <MapPinned size={16} />
            {trip.destinationCount}{" "}
            {trip.destinationCount === 1 ? "destination" : "destinations"}
          </span>
          <span className="flex items-center gap-1.5">
            <Wallet size={16} />
            {formatMoney(trip.budgetLimit, trip.currency)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/trips/${trip.id}`}
            className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-dark"
          >
            View
          </Link>
          <Link
            to={`/trips/${trip.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm font-medium hover:bg-sand"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-coral hover:bg-sand"
            onClick={() => onDelete(trip)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
