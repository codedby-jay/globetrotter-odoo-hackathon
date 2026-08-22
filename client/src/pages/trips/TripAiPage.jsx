import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TripSubnav from "../../components/TripSubnav.jsx";
import TripAssistant from "../../features/ai/TripAssistant.jsx";
import { explainApiError } from "../../lib/api.js";
import { getAiStatus } from "../../lib/aiApi.js";
import { getTrip } from "../../lib/tripsApi.js";

export default function TripAiPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [tripData, status] = await Promise.all([getTrip(id), getAiStatus()]);
        if (!cancelled) {
          setTrip(tripData.trip);
          setConfigured(Boolean(status.configured));
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load the AI assistant"));
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

  if (loading) {
    return <p className="text-sm text-muted">Loading AI Trip Assistant…</p>;
  }

  if (!trip) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">AI Trip Assistant</p>
        <h1 className="text-2xl font-semibold">{trip.name}</h1>
      </div>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <TripAssistant trip={trip} configured={configured} />
    </section>
  );
}
