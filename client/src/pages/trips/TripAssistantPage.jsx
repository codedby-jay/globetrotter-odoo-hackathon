import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TripSubnav from "../../components/TripSubnav.jsx";
import TripAssistant from "../../features/assistant/TripAssistant.jsx";
import AssistantLoading from "../../features/assistant/AssistantLoading.jsx";
import { explainApiError } from "../../lib/api.js";
import { getAssistantStatus } from "../../lib/assistantApi.js";
import { getTrip } from "../../lib/tripsApi.js";

export default function TripAssistantPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [mode, setMode] = useState("smart_analysis");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [tripData, status] = await Promise.all([getTrip(id), getAssistantStatus()]);
        if (!cancelled) {
          setTrip(tripData.trip);
          setMode(status.mode || "smart_analysis");
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load the trip assistant"));
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
    return <AssistantLoading label="Loading AI Trip Assistant…" />;
  }

  if (!trip) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <TripAssistant trip={trip} mode={mode} />
    </section>
  );
}
