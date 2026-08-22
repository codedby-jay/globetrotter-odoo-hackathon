import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Field, inputClassName } from "../../components/TripForm.jsx";
import { ApiError, explainApiError } from "../../lib/api.js";
import useEscapeClose from "../../hooks/useEscapeClose.js";
import {
  activityLabel,
  addMinutesToTime,
  formatDateRange,
} from "../../lib/dates.js";
import { fieldError, validateActivitySchedule } from "../../lib/validation.js";

function defaultEndTime(startTime, durationMin) {
  return addMinutesToTime(startTime, durationMin || 60) || "";
}

export default function AddActivityModal({
  stop,
  activity,
  initialItem,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const isEdit = Boolean(initialItem?.id);
  const catalog = activity || initialItem?.activity || null;
  const defaultDate = stop.startDate;
  const defaultStart = initialItem?.startTime || "09:00";
  const [scheduledDate, setScheduledDate] = useState(
    initialItem?.scheduledDate || defaultDate,
  );
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(
    initialItem?.endTime ||
      defaultEndTime(defaultStart, initialItem?.durationMin || catalog?.durationMin),
  );
  const [cost, setCost] = useState(
    String(
      initialItem?.cost ??
        catalog?.typicalCost ??
        0,
    ),
  );
  const [notes, setNotes] = useState(initialItem?.notes || "");
  const [errors, setErrors] = useState({});
  useEscapeClose(onClose, !submitting);

  const title = useMemo(
    () => activityLabel(isEdit ? initialItem : catalog),
    [catalog, initialItem, isEdit],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const nextErrors = validateActivitySchedule({
      scheduledDate,
      startTime,
      endTime,
      cost,
      stopStart: stop.startDate,
      stopEnd: stop.endDate,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      scheduledDate,
      startTime,
      endTime,
      cost: Number(cost),
      notes: notes.trim() || null,
    };
    if (!isEdit) {
      payload.activityId = catalog?.id;
      if (!catalog?.id && catalog) {
        payload.activity = {
          name: catalog.name,
          type: catalog.type,
          description: catalog.description,
          imageUrl: catalog.imageUrl,
          durationMin: catalog.durationMin,
          typicalCost: catalog.typicalCost,
          latitude: catalog.lat,
          longitude: catalog.lng,
          externalId: catalog.externalId,
        };
      }
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      const details = err instanceof ApiError ? err.details : null;
      setErrors({
        scheduledDate: fieldError(details, "scheduledDate"),
        startTime: fieldError(details, "startTime"),
        endTime: fieldError(details, "endTime"),
        cost: fieldError(details, "cost") || (err.message?.includes("negative") ? err.message : ""),
        form: explainApiError(err, "Unable to save this activity"),
      });
    }
  }

  return (
    <div className="gt-modal-backdrop">
      <div className="gt-modal max-w-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit activity" : "Add activity"}
            </h2>
            <p className="text-sm text-muted">{stop.city?.name}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 hover:bg-sand"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 rounded-xl bg-cream p-3 text-sm">
          <span className="block font-medium">{title}</span>
          <span className="text-muted">
            Destination: {stop.city?.name} · {formatDateRange(stop.startDate, stop.endDate)}
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={submitting} className="contents">
          <Field label="Date" error={errors.scheduledDate}>
            <input
              className={inputClassName}
              type="date"
              min={stop.startDate}
              max={stop.endDate}
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
            />
          </Field>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-3">
            <Field label="Start time" error={errors.startTime}>
              <input
                className={inputClassName}
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </Field>
            <Field label="End time" error={errors.endTime}>
              <input
                className={inputClassName}
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </Field>
          </div>
          <Field label="Cost" error={errors.cost}>
            <input
              className={inputClassName}
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </Field>
          <Field label="Notes">
            <textarea
              className={`${inputClassName} min-h-20`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
          {error || errors.form ? (
            <p className="mb-3 text-sm text-coral">{error || errors.form}</p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gt-btn gt-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : isEdit ? "Save activity" : "Save"}
            </button>
          </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
