import { Link } from "react-router-dom";
import { formatDateRange } from "../../lib/dates.js";

export default function MapPopup({ stop, tripId }) {
  const place = [stop.country, stop.region].filter(Boolean).join(" · ");

  return (
    <div className="min-w-40 text-sm text-ink">
      <p className="font-semibold">
        #{stop.order} {stop.name}
      </p>
      {place ? <p className="text-muted">{place}</p> : null}
      <p className="mt-1 text-muted">{formatDateRange(stop.startDate, stop.endDate)}</p>
      <Link
        to={`/trips/${tripId}/edit`}
        className="mt-2 inline-flex text-sm font-medium text-teal hover:text-teal-dark"
      >
        View destination
      </Link>
    </div>
  );
}
