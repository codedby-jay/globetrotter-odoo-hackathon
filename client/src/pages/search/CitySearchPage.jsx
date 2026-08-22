import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Plane } from "lucide-react";
import AddStopModal from "../../features/itinerary/AddStopModal.jsx";
import CityResultCard from "../../features/search/CityResultCard.jsx";
import CitySearchBox from "../../features/search/CitySearchBox.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import TripSubnav from "../../components/TripSubnav.jsx";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import useEscapeClose from "../../hooks/useEscapeClose.js";
import { explainApiError } from "../../lib/api.js";
import { formatDateRange } from "../../lib/dates.js";
import { listTrips, getTrip } from "../../lib/tripsApi.js";
import { createStop, searchCities } from "../../lib/stopsApi.js";

export default function CitySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(Boolean(tripId));
  const [selectedCity, setSelectedCity] = useState(null);
  const [pickerCity, setPickerCity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  useEscapeClose(() => setPickerCity(null), Boolean(pickerCity));

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      setTripLoading(false);
      listTrips()
        .then((data) => setTrips(data.trips || []))
        .catch(() => setTrips([]));
      return undefined;
    }
    let cancelled = false;
    setTripLoading(true);
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
      })
      .finally(() => {
        if (!cancelled) {
          setTripLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    setError("");
    searchCities(debouncedQuery.trim())
      .then((data) => {
        if (!cancelled) {
          setResults(data.results);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to search cities"));
          setResults([]);
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
  }, [debouncedQuery]);

  const existingCityIds = useMemo(
    () => (trip?.stops || []).map((stop) => stop.city?.id).filter(Boolean),
    [trip],
  );

  function handleResultClick(city) {
    setNotice("");
    setModalError("");
    if (tripId && trip) {
      setSelectedCity(city);
      return;
    }
    if (tripId && !trip) {
      setError(error || "Open a trip first to add this destination.");
      return;
    }
    setPickerCity(city);
  }

  function chooseTrip(nextTrip) {
    setSearchParams({ tripId: nextTrip.id });
    setTrip(nextTrip);
    setPickerCity(null);
    setSelectedCity(pickerCity);
  }

  async function handleAdd(payload) {
    if (saving) {
      return;
    }
    const targetTripId = tripId || trip?.id;
    if (!targetTripId) {
      setModalError("Open a trip first to add this destination.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await createStop(targetTripId, {
        cityId: payload.cityId,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      const cityName = selectedCity?.name || "Destination";
      setSelectedCity(null);
      navigate(`/trips/${targetTripId}/edit`, {
        state: { addedDestination: cityName },
      });
    } catch (err) {
      setModalError(explainApiError(err, "Unable to add this destination"));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      {tripId ? <TripSubnav tripId={tripId} /> : null}
      {tripId && tripLoading ? <PageLoader label="Loading trip…" /> : null}
      <div className="gt-card p-6 md:p-8">
        <p className="gt-eyebrow">City search</p>
        <h1 className="gt-title mt-2">Where do you want to go?</h1>
        <p className="gt-lede mt-2">
          Search real cities and add them to your itinerary.
        </p>
        {trip ? (
          <p className="mt-3 text-sm font-medium text-teal-dark">
            Add destination to {trip.name} ({formatDateRange(trip.startDate, trip.endDate)})
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Open a trip first to add this destination, or choose a trip after you
            tap Add to trip.
          </p>
        )}
        <div className="mt-6">
          <CitySearchBox value={query} onChange={setQuery} />
        </div>
      </div>

      {notice ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal-dark">{notice}</p>
      ) : null}
      {searching ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle size={16} className="animate-spin" />
          Searching live city data…
        </p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {!searching && debouncedQuery.trim().length >= 2 && results.length === 0 && !error ? (
        <div className="gt-card px-6 py-10 text-center">
          <p className="font-display text-lg font-semibold">No cities found</p>
          <p className="mt-1 text-sm text-muted">Try a different spelling or city name.</p>
        </div>
      ) : null}

      {debouncedQuery.trim().length < 2 && !searching ? (
        <div className="gt-card px-6 py-10 text-center">
          <Plane className="mx-auto mb-3 text-teal" size={32} />
          <p className="font-display text-lg font-semibold">Your journey starts here</p>
          <p className="mt-1 text-sm text-muted">
            Search for a city and add it to a trip.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {results.map((city) => (
          <CityResultCard
            key={city.id}
            city={city}
            actionLabel="Add to trip"
            warning={
              existingCityIds.includes(city.id)
                ? "This city is already on the trip. You can still add another stay."
                : null
            }
            onAdd={handleResultClick}
          />
        ))}
      </div>

      {pickerCity ? (
        <div className="gt-modal-backdrop">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="choose-trip-title"
            className="gt-modal max-w-lg"
          >
            <h2 id="choose-trip-title" className="text-lg font-semibold">Add {pickerCity.name} to a trip</h2>
            <p className="mt-1 text-sm text-muted">
              Open a trip first to add this destination.
            </p>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {trips.length === 0 ? (
                <p className="text-sm text-muted">You haven't planned any trips yet.</p>
              ) : (
                trips.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-sand px-3 py-3 text-left hover:bg-cream"
                    onClick={() => chooseTrip(item)}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted">
                      {formatDateRange(item.startDate, item.endDate)}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand"
                onClick={() => setPickerCity(null)}
              >
                Cancel
              </button>
              <Link
                to="/trips/new"
                className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Create a trip
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCity && trip ? (
        <AddStopModal
          trip={trip}
          existingCityIds={existingCityIds}
          initialStop={{ city: selectedCity }}
          lockCity
          onClose={() => setSelectedCity(null)}
          onSubmit={handleAdd}
          submitting={saving}
          error={modalError}
        />
      ) : null}
    </section>
  );
}
