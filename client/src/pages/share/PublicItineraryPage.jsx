import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, Globe, MapPin, Share2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { explainApiError } from "../../lib/api.js";
import { buildCalendar } from "../../lib/calendar.js";
import {
  activityLabel,
  formatCurrency,
  formatDateRange,
  formatTimeDisplay,
  formatWeekdayDate,
} from "../../lib/dates.js";
import { copyPublicTrip, getPublicTrip, publicTripUrl } from "../../lib/shareApi.js";

export default function PublicItineraryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [privateTrip, setPrivateTrip] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copiedTripId, setCopiedTripId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setPrivateTrip(false);
      try {
        const data = await getPublicTrip(slug);
        if (!cancelled) {
          setTrip(data.trip);
          document.title = `${data.trip.name} | GlobeTrotter`;
          const meta = document.querySelector('meta[name="description"]');
          if (meta) {
            meta.setAttribute("content", data.trip.description || data.trip.name);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setTrip(null);
          if (err.status === 404 && err.message?.toLowerCase().includes("private")) {
            setPrivateTrip(true);
            setError("This trip is private.");
          } else if (err.status === 404) {
            setError("Trip not found");
          } else {
            setError(explainApiError(err, "Unable to load this itinerary."));
          }
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
      document.title = "GlobeTrotter";
    };
  }, [slug]);

  const calendar = useMemo(() => (trip ? buildCalendar(trip) : null), [trip]);
  const routeLabel = (trip?.stops || [])
    .map((stop) => stop.city?.name)
    .filter(Boolean)
    .join(" → ");

  async function handleCopy() {
    if (!user) {
      setNotice("Login to copy this trip.");
      navigate(`/login?next=/p/${slug}`);
      return;
    }
    setCopying(true);
    setNotice("");
    try {
      const data = await copyPublicTrip(slug);
      setCopiedTripId(data.trip.id);
      setNotice("Trip copied successfully!");
    } catch (err) {
      setNotice(explainApiError(err, "Unable to copy this trip"));
    } finally {
      setCopying(false);
    }
  }

  async function handleShare() {
    const url = publicTripUrl(slug);
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip?.name || "GlobeTrotter trip",
          text: trip?.description || "Check out this itinerary.",
          url,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Link copied!");
    } catch {
      setNotice("Unable to copy the link.");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading itinerary...</p>;
  }

  if (privateTrip) {
    return (
      <section className="rounded-2xl border border-sand bg-white px-6 py-12 text-center shadow-sm">
        <Globe className="mx-auto mb-3 text-teal" size={32} />
        <h1 className="text-2xl font-semibold">This trip is private.</h1>
        <p className="mt-2 text-muted">The owner has not shared this itinerary.</p>
      </section>
    );
  }

  if (!trip) {
    return (
      <section className="rounded-2xl border border-sand bg-white px-6 py-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">{error || "Trip not found"}</h1>
      </section>
    );
  }

  return (
    <article className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-sand bg-white shadow-sm">
        <div className="bg-gradient-to-br from-teal to-teal-dark px-6 py-10 text-white md:px-10">
          <p className="text-sm font-medium tracking-wide text-white/80">🌍 GlobeTrotter</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{trip.name}</h1>
          <p className="mt-3 text-white/90">{formatDateRange(trip.startDate, trip.endDate)}</p>
          {routeLabel ? <p className="mt-2 text-lg text-white/90">{routeLabel}</p> : null}
          {trip.description ? <p className="mt-4 max-w-2xl text-white/80">{trip.description}</p> : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              onClick={handleCopy}
              disabled={copying}
            >
              <Copy size={16} />
              {copying ? "Copying trip..." : "Copy this trip"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
              onClick={handleShare}
            >
              <Share2 size={16} />
              Share
            </button>
            {!user ? (
              <Link
                to={`/login?next=/p/${slug}`}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-teal-dark"
              >
                Log in
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {notice ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal-dark">
          {notice}{" "}
          {copiedTripId ? (
            <Link className="font-medium text-teal" to={`/trips/${copiedTripId}/edit`}>
              View my trip
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="space-y-4">
        {(calendar?.days || []).map((day, index) => (
          <section key={day.date} className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              Day {index + 1}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{formatWeekdayDate(day.date)}</h2>
            {day.stops.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No destination planned</p>
            ) : (
              day.stops.map((stop) => (
                <div key={`${day.date}-${stop.position}`} className="mt-4">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <MapPin size={16} className="text-teal" />
                    {stop.city?.name}
                    {stop.city?.country ? `, ${stop.city.country}` : ""}
                  </h3>
                  {stop.activities.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">No activities planned</p>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      {stop.activities.map((item, activityIndex) => (
                        <li key={`${day.date}-${stop.position}-${activityIndex}`} className="border-l-2 border-sand pl-4">
                          <p className="text-sm font-semibold text-teal">
                            {formatTimeDisplay(item.startTime) || item.startTime || "—"}
                          </p>
                          <p className="font-medium">{activityLabel(item)}</p>
                          <p className="text-sm text-muted">{item.category}</p>
                          {item.cost ? (
                            <p className="text-sm">{formatCurrency(item.cost, trip.currency)}</p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
