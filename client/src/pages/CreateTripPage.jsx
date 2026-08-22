import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "../components/TripForm.jsx";
import { ApiError, explainApiError } from "../lib/api.js";
import { createTrip } from "../lib/tripsApi.js";
import { fieldError, validateTrip } from "../lib/validation.js";

const emptyForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  budgetLimit: "",
  currency: "USD",
  coverPhotoUrl: "",
};

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const nextErrors = validateTrip(values);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || null,
        startDate: values.startDate,
        endDate: values.endDate,
        budgetLimit: values.budgetLimit === "" ? null : Number(values.budgetLimit),
        currency: values.currency,
        coverPhotoUrl: values.coverPhotoUrl.trim() || null,
      };
      const data = await createTrip(payload);
      navigate(`/trips/${data.trip.id}/edit`);
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
      setFormError(explainApiError(error, "Unable to create trip"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl gt-card p-6 md:p-8">
      <p className="gt-eyebrow">New trip</p>
      <h1 className="gt-title mt-2">Plan a trip</h1>
      <p className="gt-lede mb-6 mt-2">
        Set the basics now. Cities and activities will be added in the itinerary
        builder next.
      </p>
      <TripForm
        initialValues={{ values, errors, onChange }}
        submitLabel="Save trip"
        submitting={submitting}
        formError={formError}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
