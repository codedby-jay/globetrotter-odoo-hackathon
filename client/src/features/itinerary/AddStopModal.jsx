import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import CityResultCard from "../search/CityResultCard.jsx";
import CitySearchBox from "../search/CitySearchBox.jsx";
import { Field, inputClassName } from "../../components/TripForm.jsx";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { ApiError } from "../../lib/api.js";
import { searchCities } from "../../lib/stopsApi.js";
import { fieldError, validateStopDates } from "../../lib/validation.js";

export default function AddStopModal({
  trip,
  existingCityIds = [],
  initialStop,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const isEdit = Boolean(initialStop?.id);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedCity, setSelectedCity] = useState(initialStop?.city || null);
  const [startDate, setStartDate] = useState(initialStop?.startDate || trip.startDate);
  const [endDate, setEndDate] = useState(initialStop?.endDate || trip.endDate);
  const [notes, setNotes] = useState(initialStop?.notes || "");
  const [stayCost, setStayCost] = useState(
    initialStop?.stayCost != null ? String(initialStop.stayCost) : "0",
  );
  const [transportCost, setTransportCost] = useState(
    initialStop?.transportCost != null ? String(initialStop.transportCost) : "0",
  );
  const [errors, setErrors] = useState({});
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setSearchError("");
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;
    setSearching(true);
    setSearchError("");

    searchCities(debouncedQuery.trim())
      .then((data) => {
        if (!cancelled && !controller.signal.aborted) {
          setResults(data.results);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSearchError(err.message || "Unable to search cities");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearching(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateStopDates({
      startDate,
      endDate,
      tripStart: trip.startDate,
      tripEnd: trip.endDate,
    });
    if (!selectedCity) {
      nextErrors.city = "Select a destination";
    }
    if (Number(stayCost) < 0) {
      nextErrors.stayCost = "Stay cost cannot be negative";
    }
    if (Number(transportCost) < 0) {
      nextErrors.transportCost = "Transport cost cannot be negative";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        cityId: selectedCity.id,
        startDate,
        endDate,
        notes: notes.trim() || null,
        stayCost: isEdit ? Number(stayCost) : undefined,
        transportCost: isEdit ? Number(transportCost) : undefined,
      });
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors({
          startDate: fieldError(err.details, "startDate"),
          endDate: fieldError(err.details, "endDate"),
          city: fieldError(err.details, "cityId"),
        });
      }
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit destination" : "Add destination"}
            </h2>
            <p className="text-sm text-muted">{trip.name}</p>
          </div>
          <button type="button" className="rounded-lg p-1 hover:bg-sand" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!isEdit || !selectedCity ? (
          <div className="mb-4">
            <CitySearchBox value={query} onChange={setQuery} />
            {searching ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <LoaderCircle size={16} className="animate-spin" />
                Searching cities…
              </p>
            ) : null}
            {searchError ? <p className="mt-3 text-sm text-coral">{searchError}</p> : null}
            <div className="mt-3 space-y-2">
              {results.map((city) => (
                <CityResultCard
                  key={city.id}
                  city={city}
                  actionLabel="Select"
                  warning={
                    existingCityIds.includes(city.id)
                      ? "This city is already on the trip"
                      : null
                  }
                  onAdd={setSelectedCity}
                />
              ))}
            </div>
          </div>
        ) : null}

        {selectedCity ? (
          <p className="mb-4 rounded-xl bg-cream p-3 text-sm">
            Selected destination:{" "}
            <span className="font-medium">
              {selectedCity.name}, {selectedCity.country}
            </span>
            {!isEdit ? (
              <button
                type="button"
                className="ml-2 text-teal"
                onClick={() => setSelectedCity(null)}
              >
                Change
              </button>
            ) : null}
          </p>
        ) : null}
        {errors.city ? <p className="mb-3 text-sm text-coral">{errors.city}</p> : null}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-3">
            <Field label="Start date" error={errors.startDate}>
              <input
                className={inputClassName}
                type="date"
                min={trip.startDate}
                max={trip.endDate}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>
            <Field label="End date" error={errors.endDate}>
              <input
                className={inputClassName}
                type="date"
                min={trip.startDate}
                max={trip.endDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </Field>
          </div>
          {isEdit ? (
            <>
              <Field label="Notes">
                <textarea
                  className={`${inputClassName} min-h-20`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </Field>
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-3">
                <Field label="Stay cost" error={errors.stayCost}>
                  <input
                    className={inputClassName}
                    type="number"
                    min="0"
                    value={stayCost}
                    onChange={(event) => setStayCost(event.target.value)}
                  />
                </Field>
                <Field label="Transport cost" error={errors.transportCost}>
                  <input
                    className={inputClassName}
                    type="number"
                    min="0"
                    value={transportCost}
                    onChange={(event) => setTransportCost(event.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}
          {error ? <p className="mb-3 text-sm text-coral">{error}</p> : null}
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
              className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : isEdit
                  ? "Save destination"
                  : "Add destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
