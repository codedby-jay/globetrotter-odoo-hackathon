import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarRange,
  Luggage,
  MapPinned,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import TripSubnav from "../components/TripSubnav.jsx";
import BudgetSummary from "../features/budget/BudgetSummary.jsx";
import CalendarPreview from "../features/calendar/CalendarPreview.jsx";
import StopCard from "../features/itinerary/StopCard.jsx";
import { explainApiError } from "../lib/api.js";
import { getBudgetSummary } from "../lib/expensesApi.js";
import { deleteTrip, getTrip } from "../lib/tripsApi.js";
import { formatDateRange, formatMoney } from "../lib/dates.js";

export default function ItineraryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          setImageFailed(false);
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
      setError(err.message || "Unable to delete trip");
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading trip…</p>;
  }

  if (error && !trip) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const showImage = trip.coverPhotoUrl && !imageFailed;

  return (
    <section className="space-y-6">
      <TripSubnav tripId={trip.id} />
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
        <div className="h-48 bg-gradient-to-br from-teal to-teal-dark md:h-64">
          {showImage ? (
            <img
              src={trip.coverPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
        </div>
        <div className="space-y-4 p-6 md:p-8">
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                Trip overview
              </p>
              <h1 className="text-2xl font-semibold md:text-3xl">{trip.name}</h1>
              {trip.description ? (
                <p className="mt-2 max-w-2xl text-muted">{trip.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/trips/${trip.id}/edit`}
                className="inline-flex items-center gap-1 rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark"
              >
                <Pencil size={14} />
                Edit
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-coral hover:bg-sand"
                onClick={() => setPendingDelete(true)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <CalendarRange size={16} className="text-teal" />
                Dates
              </p>
              {formatDateRange(trip.startDate, trip.endDate)}
            </div>
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <Wallet size={16} className="text-teal" />
                Budget
              </p>
              {formatMoney(trip.budgetLimit, trip.currency)}
            </div>
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <MapPinned size={16} className="text-teal" />
                Destinations
              </p>
              {trip.destinationCount}{" "}
              {trip.destinationCount === 1 ? "city" : "cities"}
            </div>
          </div>
        </div>
      </div>

      {summary ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Budget</h2>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="text-sm font-medium text-teal hover:text-teal-dark"
            >
              Manage expenses
            </Link>
          </div>
          <BudgetSummary summary={summary} compact />
        </div>
      ) : null}

      <CalendarPreview trip={trip} />

      {(trip.stops || []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
          <Luggage className="mx-auto mb-3 text-teal" size={32} />
          <h2 className="text-lg font-semibold">Your journey starts here</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-muted">
            Search for a city and add your first destination.
          </p>
          <Link
            to={`/trips/${trip.id}/edit`}
            className="mt-4 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
          >
            Open builder
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Itinerary</h2>
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
