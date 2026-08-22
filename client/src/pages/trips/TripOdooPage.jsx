import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLoader from "../../components/PageLoader.jsx";
import TripSubnav from "../../components/TripSubnav.jsx";
import OdooExportModal from "../../features/odoo/OdooExportModal.jsx";
import OdooStatusCard from "../../features/odoo/OdooStatusCard.jsx";
import { explainApiError } from "../../lib/api.js";
import { exportTripToOdoo, getOdooStatus, testTripOdoo } from "../../lib/odooApi.js";
import { getTrip } from "../../lib/tripsApi.js";

export default function TripOdooPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [testing, setTesting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportResult, setExportResult] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [tripData, odooStatus] = await Promise.all([getTrip(id), getOdooStatus()]);
        if (!cancelled) {
          setTrip(tripData.trip);
          setStatus(odooStatus);
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load Odoo settings"));
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

  async function handleTest() {
    setTesting(true);
    setStatusError("");
    setNotice("");
    try {
      const result = await testTripOdoo(id);
      setStatus(result);
      setNotice(result.message || "Connection test finished.");
    } catch (err) {
      setStatusError(explainApiError(err, "Unable to test the Odoo connection"));
    } finally {
      setTesting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportError("");
    try {
      const result = await exportTripToOdoo(id);
      setExportResult(result);
      setNotice(result.message || "Trip exported to Odoo");
    } catch (err) {
      setExportError(explainApiError(err, "Unable to export this trip"));
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return <PageLoader label="Loading Odoo integration…" />;
  }

  if (!trip) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {notice ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal">{notice}</p>
      ) : null}
      <OdooStatusCard
        status={status}
        loading={false}
        error={statusError}
        testing={testing}
        onTest={handleTest}
      />
      <div className="gt-card p-6">
        <h2 className="text-lg font-semibold">Trip</h2>
        <p className="mt-1 text-muted">{trip.name}</p>
        <button
          type="button"
          className="gt-btn gt-btn-primary mt-4"
          onClick={() => {
            setExportResult(null);
            setExportError("");
            setExportOpen(true);
          }}
          disabled={testing || exporting}
        >
          Export Trip to Odoo
        </button>
      </div>
      {exportOpen ? (
        <OdooExportModal
          tripName={trip.name}
          result={exportResult}
          error={exportError}
          exporting={exporting}
          onConfirm={handleExport}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </section>
  );
}
