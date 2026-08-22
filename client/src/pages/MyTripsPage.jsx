import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Luggage } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import TripCard from "../components/TripCard.jsx";
import { deleteTrip, listTrips } from "../lib/tripsApi.js";

const FILTERS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function MyTripsPage() {
  const [status, setStatus] = useState("upcoming");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await listTrips(status);
      setTrips(data.trips);
    } catch (err) {
      setError(err.message || "Unable to load trips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await listTrips(status);
        if (!cancelled) {
          setTrips(data.trips);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load trips");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await deleteTrip(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete trip");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            My trips
          </p>
          <h1 className="text-2xl font-semibold md:text-3xl">Your itineraries</h1>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} />
          Plan new trip
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              status === filter.id
                ? "bg-teal text-white"
                : "bg-white text-muted hover:bg-sand"
            }`}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted">Loading trips…</p> : null}
      {error ? <p className="mb-4 text-sm text-coral">{error}</p> : null}

      {!loading && trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-12 text-center">
          <Luggage className="mx-auto mb-3 text-teal" size={32} />
          <h2 className="text-lg font-semibold">No {status} trips yet</h2>
          <p className="mt-1 text-sm text-muted">
            Start with a name, dates, and budget. Stops come next.
          </p>
          <Link
            to="/trips/new"
            className="mt-4 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
          >
            Create a trip
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onDelete={setPendingDelete} />
        ))}
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete this trip?"
          description={`“${pendingDelete.name}” will be permanently removed.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
        />
      ) : null}
    </section>
  );
}
