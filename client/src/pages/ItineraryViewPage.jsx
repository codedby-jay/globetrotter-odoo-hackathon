import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarRange,
  Compass,
  MapPinned,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageLoader from "../components/PageLoader.jsx";
import TripSubnav from "../components/TripSubnav.jsx";
import BudgetSummary from "../features/budget/BudgetSummary.jsx";
import CalendarPreview from "../features/calendar/CalendarPreview.jsx";
import ShareModal from "../features/share/ShareModal.jsx";
import StopCard from "../features/itinerary/StopCard.jsx";
import { explainApiError } from "../lib/api.js";
import { getBudgetSummary } from "../lib/expensesApi.js";
import { deleteTrip, getTrip } from "../lib/tripsApi.js";
import CoverImage from "../components/CoverImage.jsx";
import { formatCurrency, formatDateRange, formatMoney, tripLengthLabel } from "../lib/dates.js";
import { tripCoverFallback, tripCoverSrc } from "../lib/travelArt.js";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import StatCard from "../ui/StatCard.jsx";

export default function ItineraryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [data, budget] = await Promise.all([getTrip(id), getBudgetSummary(id)]);
        if (!cancelled) {
          setTrip(data.trip);
          setSummary(budget);
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load trip"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteTrip(id);
      navigate("/trips");
    } catch (err) {
      setError(explainApiError(err, "Unable to delete trip"));
      setDeleting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading trip…" />;
  }

  if (error && !trip) {
    return <Alert>{error}</Alert>;
  }

  const activityCount = (trip.stops || []).reduce(
    (sum, stop) => sum + (stop.activities || []).length,
    0,
  );
  const currency = trip.currency || "USD";
  const length = tripLengthLabel(trip.startDate, trip.endDate);

  return (
    <section className="space-y-7">
      <TripSubnav tripId={trip.id} />
      <div className="gt-card overflow-hidden">
        <div className="relative h-52 bg-navy md:h-80">
          <CoverImage
            src={tripCoverSrc(trip)}
            fallbackSrc={tripCoverFallback(trip)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/60">
              Trip overview
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {trip.name}
            </h1>
            <p className="mt-2 text-sm text-white/80">
              {formatDateRange(trip.startDate, trip.endDate)}
              {length ? ` · ${length}` : ""}
              {trip.destinationCount
                ? ` · ${trip.destinationCount} ${trip.destinationCount === 1 ? "destination" : "destinations"}`
                : ""}
            </p>
            {trip.description ? (
              <p className="mt-3 max-w-2xl text-sm text-white/75">{trip.description}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-5 p-5 md:p-7">
          <Alert>{error}</Alert>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" to={`/trips/${trip.id}/edit`}>
              <Pencil size={14} />
              Edit trip
            </Button>
            <Button variant="secondary" onClick={() => setShareOpen(true)}>
              <Share2 size={14} />
              Share
            </Button>
            <Button variant="danger" onClick={() => setPendingDelete(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Dates"
              value={formatDateRange(trip.startDate, trip.endDate)}
              hint={length}
              icon={CalendarRange}
            />
            <StatCard label="Budget" value={formatMoney(trip.budgetLimit, currency)} icon={Wallet} />
            <StatCard
              label="Spent"
              value={formatCurrency(summary?.totalSpent ?? 0, currency)}
              hint={`${formatCurrency(summary?.remaining ?? 0, currency)} remaining`}
            />
            <StatCard
              label="Destinations"
              value={`${trip.destinationCount} ${trip.destinationCount === 1 ? "city" : "cities"}`}
              icon={MapPinned}
            />
            <StatCard
              label="Activities"
              value={`${activityCount} ${activityCount === 1 ? "activity" : "activities"}`}
              icon={Sparkles}
            />
            <StatCard
              label="Used"
              value={`${summary?.percentageUsed ?? 0}%`}
              hint={summary?.overBudget ? "Over budget" : "On track"}
            />
          </div>
          <div>
            <p className="gt-eyebrow mb-2">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" to={`/search/cities?tripId=${trip.id}`}>
                Add destination
              </Button>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/calendar`}>
                Calendar
              </Button>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/budget`}>
                Budget
              </Button>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/map`}>
                Map
              </Button>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/assistant`}>
                AI Assistant
              </Button>
              <Button variant="secondary" size="sm" to={`/trips/${trip.id}/share`}>
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {summary ? (
        <div className="space-y-3">
          <SectionHeader
            title="Budget summary"
            action={
              <Link className="text-sm font-semibold text-teal hover:text-teal-dark" to={`/trips/${trip.id}/budget`}>
                Manage expenses
              </Link>
            }
          />
          <BudgetSummary summary={summary} compact />
        </div>
      ) : null}

      <CalendarPreview trip={trip} />

      {(trip.stops || []).length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No destinations"
          description="Add your first destination to start building your itinerary."
          action={
            <Button variant="coral" to={`/search/cities?tripId=${trip.id}`}>
              Add destination
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <SectionHeader title="Destinations" />
          {trip.stops.map((stop, index) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={index}
              currency={trip.currency}
              readOnly
            />
          ))}
        </div>
      )}

      {shareOpen ? (
        <ShareModal
          trip={trip}
          onClose={() => setShareOpen(false)}
          onSaved={(updated) => {
            setTrip({ ...trip, ...updated });
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete this trip?"
          description={`“${trip.name}” will be permanently removed.`}
          onCancel={() => setPendingDelete(false)}
          onConfirm={confirmDelete}
          busy={deleting}
        />
      ) : null}
    </section>
  );
}
