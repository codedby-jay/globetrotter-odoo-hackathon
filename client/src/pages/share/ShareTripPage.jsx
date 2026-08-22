import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TripSubnav from "../../components/TripSubnav.jsx";
import ShareModal from "../../features/share/ShareModal.jsx";
import { explainApiError } from "../../lib/api.js";
import { getTrip } from "../../lib/tripsApi.js";

export default function ShareTripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getTrip(id)
      .then((data) => {
        if (!cancelled) {
          setTrip(data.trip);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load trip"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-muted">Loading sharing settings…</p>;
  }

  if (!trip) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <ShareModal trip={trip} embedded onSaved={setTrip} />
    </section>
  );
}
