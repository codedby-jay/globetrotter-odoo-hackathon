import { MapPinned, Plus, Sparkles } from "lucide-react";
import Button from "../../ui/Button.jsx";

export default function EmptyDay({ tripId, stop, hasDestination }) {
  if (!hasDestination) {
    return (
      <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
        <MapPinned className="mx-auto mb-2 text-teal" size={22} />
        <p className="font-medium">No plans yet</p>
        <p className="mt-1 text-sm text-muted">Add a city to this part of the trip.</p>
        <Button variant="coral" size="sm" className="mt-4" to={`/search/cities?tripId=${tripId}`}>
          <Plus size={14} />
          Add destination
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
      <Sparkles className="mx-auto mb-2 text-teal" size={22} />
      <p className="font-medium">No plans yet</p>
      <p className="mt-1 text-sm text-muted">Add an activity</p>
      <Button
        variant="coral"
        size="sm"
        className="mt-4"
        to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
      >
        <Plus size={14} />
        Add activity
      </Button>
    </div>
  );
}
