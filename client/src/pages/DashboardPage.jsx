import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import TripCard from "../components/TripCard.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { explainApiError } from "../lib/api.js";
import { deleteTrip, listTrips } from "../lib/tripsApi.js";
import EmptyState from "../components/EmptyState.jsx";
import PageLoader from "../components/PageLoader.jsx";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

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
        const data = await listTrips();
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
  }, []);

  const upcomingCount = trips.filter((trip) => {
    const end = new Date(`${trip.endDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end >= today;
  }).length;

  const destinationTotal = trips.reduce((sum, trip) => sum + (trip.destinationCount || 0), 0);

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
      setError(explainApiError(err, "Unable to delete trip"));
    } finally {
      setDeleting(false);
    }
  }

  const firstName = user?.name?.split(" ")[0] || "traveler";

  return (
    <section className="space-y-8">
      <div className="overflow-hidden gt-card">
        <div className="bg-navy px-6 py-8 text-white md:flex md:items-end md:justify-between md:px-8 md:py-10">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/55">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {firstName}, plan your next adventure.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {loading
                ? "Loading your trips…"
                : upcomingCount
                  ? `${upcomingCount} upcoming ${upcomingCount === 1 ? "trip" : "trips"} on the board.`
                  : "Your next itinerary starts with a name, dates, and a destination."}
            </p>
          </div>
          <Button variant="coral" to="/trips/new" className="mt-5 md:mt-0">
            <Plus size={16} />
            Plan new trip
          </Button>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-[#fffdf9] p-4">
            <p className="gt-eyebrow">Trips</p>
            <p className="mt-1 font-display text-2xl font-semibold">{loading ? "—" : trips.length}</p>
          </div>
          <div className="bg-[#fffdf9] p-4">
            <p className="gt-eyebrow">Upcoming</p>
            <p className="mt-1 font-display text-2xl font-semibold">{loading ? "—" : upcomingCount}</p>
          </div>
          <div className="bg-[#fffdf9] p-4">
            <p className="gt-eyebrow">Destinations</p>
            <p className="mt-1 font-display text-2xl font-semibold">{loading ? "—" : destinationTotal}</p>
          </div>
        </div>
      </div>

      <Alert>{error}</Alert>

      <div>
        <SectionHeader
          title="Recent trips"
          action={
            <Link
              to="/trips"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:text-teal-dark"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          }
        />
        {loading ? <PageLoader label="Loading trips…" /> : null}
        {!loading && recentTrips.length === 0 ? (
          <EmptyState
            icon={MapPinned}
            title="No trips yet"
            description="Start planning your next adventure."
            action={
              <Button variant="coral" to="/trips/new">
                Plan a trip
              </Button>
            }
          />
        ) : null}
        {!loading && recentTrips.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={setPendingDelete} />
            ))}
          </div>
        ) : null}
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
