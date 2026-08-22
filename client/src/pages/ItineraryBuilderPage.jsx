import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPinned } from "lucide-react";
import TripForm from "../components/TripForm.jsx";
import { ApiError } from "../lib/api.js";
import { getTrip, updateTrip } from "../lib/tripsApi.js";
import { fieldError, validateTrip } from "../lib/validation.js";

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getTrip(id);
        if (!cancelled) {
          setValues({
            name: data.trip.name,
            description: data.trip.description || "",
            startDate: data.trip.startDate,
            endDate: data.trip.endDate,
            budgetLimit:
              data.trip.budgetLimit === null || data.trip.budgetLimit === undefined
                ? ""
                : String(data.trip.budgetLimit),
            currency: data.trip.currency,
            coverPhotoUrl: data.trip.coverPhotoUrl || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setFormError(err.message || "Unable to load trip");
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

  function onChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTrip(values);
    setErrors(nextErrors);
    setFormError("");
    setSaved(false);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await updateTrip(id, {
        name: values.name.trim(),
        description: values.description.trim() || null,
        startDate: values.startDate,
        endDate: values.endDate,
        budgetLimit: values.budgetLimit === "" ? null : Number(values.budgetLimit),
        currency: values.currency,
        coverPhotoUrl: values.coverPhotoUrl.trim() || null,
      });
      setSaved(true);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({
          name: fieldError(error.details, "name"),
          startDate: fieldError(error.details, "startDate"),
          endDate: fieldError(error.details, "endDate"),
          budgetLimit: fieldError(error.details, "budgetLimit"),
          coverPhotoUrl: fieldError(error.details, "coverPhotoUrl"),
          currency: fieldError(error.details, "currency"),
        });
      }
      setFormError(error.message || "Unable to update trip");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading trip…</p>;
  }

  if (!values) {
    return <p className="text-sm text-coral">{formError || "Trip not found"}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              Edit trip
            </p>
            <h1 className="text-2xl font-semibold">Trip details</h1>
          </div>
          <Link
            to={`/trips/${id}`}
            className="text-sm font-medium text-teal hover:text-teal-dark"
          >
            View trip
          </Link>
        </div>
        {saved ? (
          <p className="mb-4 text-sm text-teal-dark">Trip details saved.</p>
        ) : null}
        <TripForm
          initialValues={{ values, errors, onChange }}
          submitLabel="Save changes"
          submitting={submitting}
          formError={formError}
          onSubmit={handleSubmit}
        />
      </section>

      <section className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
        <MapPinned className="mx-auto mb-3 text-teal" size={32} />
        <h2 className="text-lg font-semibold">Itinerary builder comes next</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-muted">
          Adding cities, travel dates, and activities will be implemented in the
          next step. Your trip is already saved.
        </p>
      </section>
    </div>
  );
}
