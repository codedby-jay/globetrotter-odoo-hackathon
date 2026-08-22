import { Link } from "react-router-dom";
import { MapPinned, Plus, Sparkles } from "lucide-react";

export default function EmptyDay({ tripId, stop, hasDestination }) {
  if (!hasDestination) {
    return (
      <div className="rounded-xl border border-dashed border-sand px-4 py-8 text-center">
        <MapPinned className="mx-auto mb-2 text-teal" size={22} />
        <p className="font-medium">No destination planned</p>
        <p className="mt-1 text-sm text-muted">Add a city to this part of the trip.</p>
        <Link
          to={`/search/cities?tripId=${tripId}`}
          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={14} />
          Add destination
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-sand px-4 py-8 text-center">
      <Sparkles className="mx-auto mb-2 text-teal" size={22} />
      <p className="font-medium">No activities planned</p>
      <p className="mt-1 text-sm text-muted">
        Add something to do in {stop?.city?.name || "this destination"}.
      </p>
      <Link
        to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
        className="mt-4 inline-flex items-center gap-1 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        <Plus size={14} />
        Add activity
      </Link>
    </div>
  );
}
