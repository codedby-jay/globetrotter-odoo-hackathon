import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, MapPinned, Plane, Plus, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import TripCard from "../components/TripCard.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { explainApiError } from "../lib/api.js";
import { deleteTrip, listTrips } from "../lib/tripsApi.js";
import { TRAVEL_PHOTOS } from "../lib/travelArt.js";
import EmptyState from "../components/EmptyState.jsx";
import PageLoader from "../components/PageLoader.jsx";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

const SHORTCUTS = [
  { to: "/trips/new", label: "Holidays", hint: "Plan a multi-city trip", icon: Plane },
  { to: "/search/cities", label: "Destinations", hint: "Search cities worldwide", icon: Compass },
  { to: "/search/activities", label: "Experiences", hint: "Find things to do", icon: Search },
  { to: "/trips", label: "My trips", hint: "Open saved itineraries", icon: MapPinned },
];

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
      <div className="relative -mx-4 -mt-8 overflow-hidden md:-mt-10">
        <div className="relative min-h-[22rem] md:min-h-[26rem]">
          <img
            src={TRAVEL_PHOTOS.flight}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/25" />
          <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-4 pb-28 pt-16 md:pb-32 md:pt-20">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Welcome back, {firstName}
            </p>
            <h1 className="mt-2 max-w-xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Where do you want to fly next?
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/80">
              {loading
                ? "Loading your trips…"
                : upcomingCount
                  ? `${upcomingCount} upcoming ${upcomingCount === 1 ? "trip" : "trips"} · ${destinationTotal} destinations on the board.`
                  : "Search destinations, lock dates, and build a holiday itinerary."}
            </p>
            <div className="mt-6">
              <Button variant="coral" size="lg" to="/trips/new">
                <Plus size={16} />
                Plan a holiday
              </Button>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 pb-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHORTCUTS.map(({ to, label, hint, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="gt-card gt-card-hover flex items-start gap-3 p-4 no-underline"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold text-ink">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
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
