import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import TripCard from "../components/TripCard.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { deleteTrip, listTrips } from "../lib/tripsApi.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listTrips();
      setTrips(data.trips);
    } catch (err) {
      setError(err.message || "Unable to load trips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const upcomingCount = trips.filter((trip) => {
    const end = new Date(`${trip.endDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end >= today;
  }).length;

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await deleteTrip(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message || "Unable to delete trip");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:flex md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "traveler"}
          </h1>
          <p className="mt-2 text-muted">
            {loading
              ? "Loading your trips…"
              : `You have ${upcomingCount} upcoming ${upcomingCount === 1 ? "trip" : "trips"}.`}
          </p>
        </div>
        <Link
          to="/trips/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 md:mt-0"
        >
          <Plus size={16} />
          Plan new trip
        </Link>
      </div>

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent trips</h2>
          <Link
            to="/trips"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-dark"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <p className="text-sm text-muted">Loading trips…</p> : null}
        {!loading && recentTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
            <p className="font-medium">No trips yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first trip to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
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
