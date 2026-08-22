import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, Plane } from "lucide-react";
import AddStopModal from "../../features/itinerary/AddStopModal.jsx";
import CityResultCard from "../../features/search/CityResultCard.jsx";
import CitySearchBox from "../../features/search/CitySearchBox.jsx";
import TripSubnav from "../../components/TripSubnav.jsx";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { getTrip } from "../../lib/tripsApi.js";
import { createStop, searchCities } from "../../lib/stopsApi.js";

export default function CitySearchPage() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [trip, setTrip] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (!tripId) {
      return undefined;
    }
    let cancelled = false;
    getTrip(tripId)
      .then((data) => {
        if (!cancelled) {
          setTrip(data.trip);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load trip");
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
          setError(err.message || "Unable to search cities");
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

  async function handleAdd(payload) {
    if (!tripId) {
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await createStop(tripId, payload);
      setSelectedCity(null);
      navigate(`/trips/${tripId}/edit`);
    } catch (err) {
      setModalError(err.message || "Unable to add destination");
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
          City search
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
          Find your next destination
        </h1>
        <p className="mt-2 text-muted">
          Search real cities and add them to your itinerary.
        </p>
        {trip ? (
          <p className="mt-3 text-sm font-medium text-teal-dark">
            Add destination to {trip.name}
          </p>
        ) : null}
        <div className="mt-6">
          <CitySearchBox value={query} onChange={setQuery} />
        </div>
      </div>

      {searching ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle size={16} className="animate-spin" />
          Searching live city data…
        </p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {!searching && debouncedQuery.trim().length >= 2 && results.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
          <p className="font-medium">No cities found</p>
          <p className="mt-1 text-sm text-muted">Try a different spelling or city name.</p>
        </div>
      ) : null}

      {debouncedQuery.trim().length < 2 && !searching ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
          <Plane className="mx-auto mb-3 text-teal" size={32} />
          <p className="font-medium">Your journey starts here</p>
          <p className="mt-1 text-sm text-muted">
            Search for a city and add your first destination.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {results.map((city) => (
          <CityResultCard
            key={city.id}
            city={city}
            warning={
              existingCityIds.includes(city.id)
                ? "This city is already on the trip"
                : null
            }
            onAdd={tripId ? setSelectedCity : undefined}
            actionLabel="+ Add to trip"
          />
        ))}
      </div>

      {selectedCity && trip ? (
        <AddStopModal
          trip={trip}
          existingCityIds={existingCityIds}
          initialStop={{ city: selectedCity }}
          onClose={() => setSelectedCity(null)}
          onSubmit={handleAdd}
          submitting={saving}
          error={modalError}
        />
      ) : null}
    </section>
  );
}
