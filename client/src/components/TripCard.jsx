import { useState } from "react";
import { CalendarRange, MapPinned, Pencil, Trash2, Wallet } from "lucide-react";
import { formatDateRange, formatMoney, tripLengthLabel } from "../lib/dates.js";
import Button from "../ui/Button.jsx";

export default function TripCard({ trip, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = trip.coverPhotoUrl && !imageFailed;
  const length = tripLengthLabel(trip.startDate, trip.endDate);
  const destinations = trip.destinationCount ?? 0;

  return (
    <article className="gt-card gt-card-hover overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-navy">
        {showImage ? (
          <img
            src={trip.coverPhotoUrl}
            alt={`${trip.name} cover`}
            className="h-full w-full object-cover opacity-90"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0d5757_0%,#10212a_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            {length}
            {destinations ? ` · ${destinations} ${destinations === 1 ? "destination" : "destinations"}` : ""}
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight">{trip.name}</h2>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange size={15} className="text-teal" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPinned size={15} className="text-teal" />
            {destinations} {destinations === 1 ? "stop" : "stops"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={15} className="text-teal" />
            {formatMoney(trip.budgetLimit, trip.currency)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="primary" size="sm" to={`/trips/${trip.id}`}>
            View
          </Button>
          <Button variant="secondary" size="sm" to={`/trips/${trip.id}/edit`}>
            <Pencil size={13} />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(trip)}>
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
