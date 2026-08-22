import { CalendarRange, MapPinned, Pencil, Trash2, Wallet } from "lucide-react";
import { formatDateRange, formatMoney, tripLengthLabel } from "../lib/dates.js";
import { tripCoverFallback, tripCoverSrc } from "../lib/travelArt.js";
import Button from "../ui/Button.jsx";
import CoverImage from "./CoverImage.jsx";

export default function TripCard({ trip, onDelete }) {
  const length = tripLengthLabel(trip.startDate, trip.endDate);
  const destinations = trip.destinationCount ?? 0;
  const destinationLabel = `${destinations} ${destinations === 1 ? "destination" : "destinations"}`;

  return (
    <article className="gt-ticket gt-card-hover overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-navy">
        <CoverImage
          src={tripCoverSrc(trip)}
          fallbackSrc={tripCoverFallback(trip)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-transparent" />
        <div className="absolute top-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-navy">
          {length || "Trip"}
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/75">
            {destinations ? destinationLabel : "No destinations yet"}
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight">{trip.name}</h2>
        </div>
      </div>
      <div className="gt-ticket-stub space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange size={15} className="text-teal" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPinned size={15} className="text-teal" />
            {destinationLabel}
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
          {onDelete ? (
            <>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/edit`}>
                <Pencil size={13} />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(trip)}>
                <Trash2 size={13} />
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
