import { useEffect, useMemo, useState } from "react";
import { MapPinned, Plus, Search } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageLoader from "../components/PageLoader.jsx";
import TripCard from "../components/TripCard.jsx";
import { explainApiError } from "../lib/api.js";
import { deleteTrip, listTrips } from "../lib/tripsApi.js";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import PageHeader from "../ui/PageHeader.jsx";

const FILTERS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function MyTripsPage() {
  const [status, setStatus] = useState("upcoming");
  const [query, setQuery] = useState("");
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
      setError(explainApiError(err, "Unable to load trips"));
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
          setError(explainApiError(err, "Unable to load trips"));
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return trips;
    }
    return trips.filter((trip) => trip.name.toLowerCase().includes(needle));
  }, [trips, query]);

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
      setError(explainApiError(err, "Unable to delete trip"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="My trips"
        title="Your itineraries"
        description="Filter, open, and refine every trip from one place."
        actions={
          <Button variant="coral" to="/trips/new">
            <Plus size={16} />
            Plan new trip
          </Button>
        }
      />

      <div className="mt-6 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-sand p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${
                status === filter.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
              onClick={() => setStatus(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            className="gt-input pl-9"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search trips"
            aria-label="Search trips"
          />
        </label>
      </div>

      {loading ? <PageLoader label="Loading trips…" /> : null}
      <Alert className="mb-4">{error}</Alert>

      {!loading && visible.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title="No trips yet"
          description={
            query.trim()
              ? "No trips match that search."
              : `No ${status} trips to show. Start with a name, dates, and budget.`
          }
          action={
            <Button variant="primary" to="/trips/new">
              Plan a trip
            </Button>
          }
        />
      ) : null}

      {!loading && visible.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={setPendingDelete} />
          ))}
        </div>
      ) : null}

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
