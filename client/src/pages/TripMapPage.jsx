import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Luggage } from "lucide-react";
import TripSubnav from "../components/TripSubnav.jsx";
import TripMap from "../features/map/TripMap.jsx";
import { explainApiError } from "../lib/api.js";
import { formatDateRange } from "../lib/dates.js";
import { mapStopsFromTrip } from "../lib/map.js";
import { getTrip } from "../lib/tripsApi.js";

export default function TripMapPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getTrip(id);
        if (!cancelled) {
          setTrip(data.trip);
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load this trip map"));
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

  const mapped = useMemo(() => mapStopsFromTrip(trip), [trip]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-full bg-sand" />
        <div className="h-[420px] animate-pulse rounded-2xl bg-sand md:h-[560px]" />
        <p className="text-sm text-muted">Loading trip map…</p>
      </section>
    );
  }

  if (!trip) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Trip map</p>
        <h1 className="text-2xl font-semibold">{trip.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Destinations in itinerary order. The displayed route is a visual connection between
          itinerary destinations and is not a real road/navigation route.
        </p>
      </div>
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      {mapped.all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-12 text-center">
          <Luggage className="mx-auto mb-3 text-teal" size={32} />
          <h2 className="text-lg font-semibold">No destinations yet</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-muted">
            Add destinations to see your trip on the map.
          </p>
          <Link
            to={`/search/cities?tripId=${id}`}
            className="mt-4 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
          >
            Add destination
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div>
            {mapped.mappable.length === 0 ? (
              <div className="flex h-[420px] items-center justify-center rounded-2xl border border-sand bg-white p-6 text-center text-sm text-muted md:h-[560px]">
                Some destinations cannot be displayed on the map because coordinates are
                unavailable.
              </div>
            ) : (
              <TripMap
                stops={mapped.mappable}
                skippedCount={mapped.skipped.length}
                selectedId={selectedId}
                onSelect={setSelectedId}
                tripId={id}
              />
            )}
            {mapped.skipped.length > 0 && mapped.mappable.length > 0 ? (
              <p className="mt-2 text-sm text-coral">
                Some destinations cannot be displayed on the map because coordinates are
                unavailable.
              </p>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Trip Route</h2>
            <p className="mb-4 text-xs text-muted">Itinerary order, not a driving route.</p>
            <ol>
              {mapped.all.map((stop, index) => {
                const coords = mapped.mappable.find((item) => item.id === stop.id);
                const order = index + 1;
                const selectable = Boolean(coords);
                const active = selectedId === stop.id;
                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      className={[
                        "w-full rounded-xl px-3 py-3 text-left",
                        active ? "bg-cream" : "hover:bg-sand/60",
                        selectable ? "" : "cursor-default opacity-70",
                      ].join(" ")}
                      onClick={() => {
                        if (selectable) {
                          setSelectedId(stop.id);
                        }
                      }}
                      disabled={!selectable}
                    >
                      <p className="text-sm font-semibold">
                        {String(order).padStart(2, "0")} {stop.city?.name || "Unknown city"}
                      </p>
                      <p className="text-xs text-muted">
                        {[stop.city?.country, stop.city?.region].filter(Boolean).join(" · ") ||
                          "Location unavailable"}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateRange(stop.startDate, stop.endDate)}
                      </p>
                    </button>
                    {index < mapped.all.length - 1 ? (
                      <p className="py-1 text-center text-teal" aria-hidden>
                        ↓
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      )}
    </section>
  );
}
