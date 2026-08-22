import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Sparkles } from "lucide-react";
import ActivityResultCard from "../../features/activities/ActivityResultCard.jsx";
import ActivitySearchBox from "../../features/activities/ActivitySearchBox.jsx";
import AddActivityModal from "../../features/activities/AddActivityModal.jsx";
import TripSubnav from "../../components/TripSubnav.jsx";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { explainApiError } from "../../lib/api.js";
import { createStopActivity, searchActivities } from "../../lib/activitiesApi.js";
import { formatDateRange } from "../../lib/dates.js";
import { getTrip } from "../../lib/tripsApi.js";

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get("tripId");
  const stopId = searchParams.get("stopId");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [trip, setTrip] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const stop = trip?.stops?.find((item) => item.id === stopId) || null;
  const cityName = stop?.city?.name || "this destination";

  useEffect(() => {
    if (!tripId) {
      setError("Open a destination from the itinerary builder to add activities.");
      return undefined;
    }
    let cancelled = false;
    getTrip(tripId)
      .then((data) => {
        if (!cancelled) {
          setTrip(data.trip);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTrip(null);
          setError(explainApiError(err, "Unable to load that trip"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (!stop?.city?.id) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    searchActivities(stop.city.id, debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResults([]);
          setError(explainApiError(err, "Unable to search activities"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [stop?.city?.id, debouncedQuery]);

  async function handleAdd(payload) {
    if (!stop) {
      setModalError("Open a destination first to add this activity.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await createStopActivity(stop.id, payload);
      const name = selected?.name || "Activity";
      setSelected(null);
      navigate(`/trips/${tripId}/edit`, {
        state: { addedActivity: name, addedStopId: stop.id },
      });
    } catch (err) {
      setModalError(explainApiError(err, "Unable to add this activity"));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      {tripId ? <TripSubnav tripId={tripId} /> : null}
      <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">
          Activity search
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
          Plan what you will do
        </h1>
        {stop ? (
          <p className="mt-2 text-muted">
            Add activities to {stop.city?.name} ({formatDateRange(stop.startDate, stop.endDate)})
          </p>
        ) : (
          <p className="mt-2 text-muted">
            Open a destination first, then search activities for that city.
          </p>
        )}
        <div className="mt-6">
          <ActivitySearchBox
            value={query}
            onChange={setQuery}
            placeholder={`Search activities in ${cityName}...`}
          />
        </div>
      </div>

      {searching ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle size={16} className="animate-spin" />
          Searching activities…
        </p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {!stop && !error ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
          <Sparkles className="mx-auto mb-3 text-teal" size={32} />
          <p className="font-medium">Choose a destination first</p>
          <p className="mt-1 text-sm text-muted">
            Activities are added to a specific stop on your itinerary.
          </p>
          <Link
            to="/trips"
            className="mt-4 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
          >
            Open my trips
          </Link>
        </div>
      ) : null}

      {!searching && stop && results.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
          <p className="font-medium">No activities found</p>
          <p className="mt-1 text-sm text-muted">
            Try a different name or category, such as food or sightseeing.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {results.map((activity) => (
          <ActivityResultCard
            key={activity.id}
            activity={activity}
            currency={trip?.currency}
            onAdd={setSelected}
          />
        ))}
      </div>

      {selected && stop ? (
        <AddActivityModal
          stop={stop}
          activity={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleAdd}
          submitting={saving}
          error={modalError}
        />
      ) : null}
    </section>
  );
}
