import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MapPinned, Plus } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import TripForm from "../components/TripForm.jsx";
import TripSubnav from "../components/TripSubnav.jsx";
import AddActivityModal from "../features/activities/AddActivityModal.jsx";
import AddStopModal from "../features/itinerary/AddStopModal.jsx";
import StopCard from "../features/itinerary/StopCard.jsx";
import { ApiError, explainApiError } from "../lib/api.js";
import {
  deleteStopActivity,
  reorderStopActivities,
  updateStopActivity,
} from "../lib/activitiesApi.js";
import { formatDateRange, formatMoney, activityLabel } from "../lib/dates.js";
import { createStop, deleteStop, reorderStops, updateStop } from "../lib/stopsApi.js";
import { getTrip, updateTrip } from "../lib/tripsApi.js";
import { fieldError, validateTrip } from "../lib/validation.js";

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null);
  const [modalError, setModalError] = useState("");
  const [savingStop, setSavingStop] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [stopError, setStopError] = useState("");
  const [addedNotice, setAddedNotice] = useState(
    location.state?.addedDestination
      ? `${location.state.addedDestination} was added to this itinerary.`
      : location.state?.addedActivity
        ? `${location.state.addedActivity} was added to this destination.`
        : "",
  );
  const [activityModal, setActivityModal] = useState(null);
  const [activityModalError, setActivityModalError] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [pendingDeleteActivity, setPendingDeleteActivity] = useState(null);
  const [activityReordering, setActivityReordering] = useState(false);

  async function loadTrip() {
    const data = await getTrip(id);
    setTrip(data.trip);
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
    return data.trip;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getTrip(id);
        if (!cancelled) {
          setTrip(data.trip);
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
      await loadTrip();
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

  async function handleStopSubmit(payload) {
    setSavingStop(true);
    setModalError("");
    try {
      if (modal?.id) {
        await updateStop(modal.id, payload);
      } else {
        await createStop(id, {
          cityId: payload.cityId,
          startDate: payload.startDate,
          endDate: payload.endDate,
        });
      }
      setModal(null);
      await loadTrip();
    } catch (err) {
      setModalError(err.message || "Unable to save destination");
      throw err;
    } finally {
      setSavingStop(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    setStopError("");
    try {
      await deleteStop(pendingDelete.id);
      setPendingDelete(null);
      await loadTrip();
    } catch (err) {
      setStopError(err.message || "Unable to remove destination");
    } finally {
      setDeleting(false);
    }
  }

  async function moveStop(index, direction) {
    if (!trip) {
      return;
    }
    const next = [...trip.stops];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) {
      return;
    }
    const previous = trip.stops;
    const [moved] = next.splice(index, 1);
    next.splice(swapWith, 0, moved);
    setTrip({ ...trip, stops: next });
    setReordering(true);
    setStopError("");
    try {
      const data = await reorderStops(
        trip.id,
        next.map((stop) => stop.id),
      );
      setTrip({ ...trip, stops: data.stops });
    } catch (err) {
      setTrip({ ...trip, stops: previous });
      setStopError(err.message || "Unable to reorder destinations");
    } finally {
      setReordering(false);
    }
  }

  async function handleActivitySubmit(payload) {
    if (!activityModal?.item) {
      return;
    }
    setSavingActivity(true);
    setActivityModalError("");
    try {
      await updateStopActivity(activityModal.item.id, payload);
      setActivityModal(null);
      setAddedNotice("Activity updated.");
      await loadTrip();
    } catch (err) {
      setActivityModalError(explainApiError(err, "Unable to update this activity"));
      throw err;
    } finally {
      setSavingActivity(false);
    }
  }

  async function confirmDeleteActivity() {
    if (!pendingDeleteActivity) {
      return;
    }
    setDeleting(true);
    setStopError("");
    try {
      await deleteStopActivity(pendingDeleteActivity.item.id);
      setPendingDeleteActivity(null);
      setAddedNotice("Activity removed.");
      await loadTrip();
    } catch (err) {
      setStopError(explainApiError(err, "Unable to remove this activity"));
    } finally {
      setDeleting(false);
    }
  }

  async function moveActivity(stop, index, direction) {
    const current = [...(stop.activities || [])];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= current.length) {
      return;
    }
    const previousStops = trip.stops;
    const next = [...current];
    const [moved] = next.splice(index, 1);
    next.splice(swapWith, 0, moved);
    setTrip({
      ...trip,
      stops: trip.stops.map((item) =>
        item.id === stop.id ? { ...item, activities: next } : item,
      ),
    });
    setActivityReordering(true);
    setStopError("");
    try {
      const data = await reorderStopActivities(
        stop.id,
        next.map((item) => item.id),
      );
      setTrip({
        ...trip,
        stops: trip.stops.map((item) =>
          item.id === stop.id ? { ...item, activities: data.activities } : item,
        ),
      });
    } catch (err) {
      setTrip({ ...trip, stops: previousStops });
      setStopError(explainApiError(err, "Unable to reorder activities"));
    } finally {
      setActivityReordering(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading trip…</p>;
  }

  if (!values || !trip) {
    return <p className="text-sm text-coral">{formError || "Trip not found"}</p>;
  }

  const stops = trip.stops || [];
  const existingCityIds = stops.map((stop) => stop.city?.id).filter(Boolean);

  return (
    <div className="space-y-6">
      <TripSubnav tripId={id} />

      <section className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">
          Itinerary builder
        </p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{trip.name}</h1>
        <p className="mt-2 text-muted">
          {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
          {formatMoney(trip.budgetLimit, trip.currency)}
        </p>
        <Link
          to={`/trips/${id}`}
          className="mt-4 inline-block text-sm font-medium text-teal hover:text-teal-dark"
        >
          View trip
        </Link>
      </section>

      <section className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-4 text-lg font-semibold">Trip details</h2>
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

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Your itinerary</h2>
          <Link
            to={`/search/cities?tripId=${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} />
            Add destination
          </Link>
        </div>
        {addedNotice ? (
          <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal-dark">
            {addedNotice}{" "}
            <Link className="font-medium text-teal" to={`/search/cities?tripId=${id}`}>
              Add another destination
            </Link>
          </p>
        ) : null}
        {stopError ? <p className="text-sm text-coral">{stopError}</p> : null}
        {stops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-12 text-center">
            <MapPinned className="mx-auto mb-3 text-teal" size={32} />
            <h3 className="text-lg font-semibold">Your journey starts here</h3>
            <p className="mt-1 text-sm text-muted">
              Search for a city and add your first destination.
            </p>
            <Link
              to={`/search/cities?tripId=${id}`}
              className="mt-4 inline-flex rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              + Add destination
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <StopCard
                key={stop.id}
                stop={stop}
                index={index}
                tripId={id}
                currency={trip.currency}
                isFirst={index === 0}
                isLast={index === stops.length - 1}
                reordering={reordering}
                activityReordering={activityReordering}
                onEdit={() => {
                  setModalError("");
                  setModal(stop);
                }}
                onDelete={() => setPendingDelete(stop)}
                onMoveUp={() => moveStop(index, -1)}
                onMoveDown={() => moveStop(index, 1)}
                onEditActivity={(currentStop, item) => {
                  setActivityModalError("");
                  setActivityModal({ stop: currentStop, item });
                }}
                onDeleteActivity={(currentStop, item) =>
                  setPendingDeleteActivity({ stop: currentStop, item })
                }
                onMoveActivity={moveActivity}
              />
            ))}
          </div>
        )}
      </section>

      {modal ? (
        <AddStopModal
          trip={trip}
          existingCityIds={existingCityIds}
          initialStop={modal.id ? modal : undefined}
          onClose={() => setModal(null)}
          onSubmit={handleStopSubmit}
          submitting={savingStop}
          error={modalError}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Remove destination?"
          description={`Remove ${pendingDelete.city?.name || "this city"} from this itinerary?`}
          confirmLabel="Remove destination"
          busyLabel="Removing…"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
        />
      ) : null}

      {activityModal ? (
        <AddActivityModal
          stop={activityModal.stop}
          initialItem={activityModal.item}
          onClose={() => setActivityModal(null)}
          onSubmit={handleActivitySubmit}
          submitting={savingActivity}
          error={activityModalError}
        />
      ) : null}

      {pendingDeleteActivity ? (
        <ConfirmDialog
          title="Remove activity?"
          description={`Remove ${activityLabel(pendingDeleteActivity.item)} from ${pendingDeleteActivity.stop.city?.name || "this destination"}?`}
          confirmLabel="Remove activity"
          busyLabel="Removing…"
          onCancel={() => setPendingDeleteActivity(null)}
          onConfirm={confirmDeleteActivity}
          busy={deleting}
        />
      ) : null}
    </div>
  );
}
