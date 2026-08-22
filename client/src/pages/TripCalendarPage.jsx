import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import TripSubnav from "../components/TripSubnav.jsx";
import AddActivityModal from "../features/activities/AddActivityModal.jsx";
import CalendarHeader from "../features/calendar/CalendarHeader.jsx";
import CalendarActivityCard from "../features/calendar/CalendarActivityCard.jsx";
import DayTimeline from "../features/calendar/DayTimeline.jsx";
import { explainApiError } from "../lib/api.js";
import { updateStopActivity } from "../lib/activitiesApi.js";
import { buildCalendar } from "../lib/calendar.js";
import { addDays, clampDate, todayDate } from "../lib/dates.js";
import { getTrip } from "../lib/tripsApi.js";

export default function TripCalendarPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  async function loadTrip() {
    const data = await getTrip(id);
    setTrip(data.trip);
    return data.trip;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getTrip(id);
        if (!cancelled) {
          setTrip(data.trip);
          setSelectedDate((current) =>
            clampDate(current || todayDate(), data.trip.startDate, data.trip.endDate),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(explainApiError(err, "Unable to load calendar"));
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

  const calendar = useMemo(() => (trip ? buildCalendar(trip) : null), [trip]);
  const today = todayDate();
  const todayInRange = Boolean(
    trip && today >= trip.startDate && today <= trip.endDate,
  );

  async function handleUpdate(payload) {
    if (!editing) {
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await updateStopActivity(editing.item.id, payload);
      setEditing(null);
      setNotice("Activity schedule updated.");
      await loadTrip();
    } catch (err) {
      setModalError(explainApiError(err, "Unable to update this activity"));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading calendar…</p>;
  }

  if (!trip || !calendar) {
    return <p className="text-sm text-coral">{error || "Trip not found"}</p>;
  }

  const selectedDay = calendar.days.find((day) => day.date === selectedDate) || calendar.days[0];
  const daysToShow = view === "all" ? calendar.days : selectedDay ? [selectedDay] : [];

  return (
    <section className="space-y-6">
      <TripSubnav tripId={id} />
      <CalendarHeader
        trip={trip}
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        canPrev={selectedDate > trip.startDate}
        canNext={selectedDate < trip.endDate}
        todayInRange={todayInRange}
        onPrev={() => setSelectedDate(clampDate(addDays(selectedDate, -1), trip.startDate, trip.endDate))}
        onNext={() => setSelectedDate(clampDate(addDays(selectedDate, 1), trip.startDate, trip.endDate))}
        onToday={() => setSelectedDate(clampDate(today, trip.startDate, trip.endDate))}
      />

      {notice ? (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-teal-dark">{notice}</p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <DayTimeline
        days={daysToShow}
        tripId={id}
        currency={trip.currency}
        compact={view === "all"}
        onEditActivity={(stop, item) => {
          setModalError("");
          setEditing({ stop, item });
        }}
      />

      {calendar.unscheduled.length > 0 ? (
        <section className="rounded-2xl border border-sand bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays size={18} className="text-teal" />
            Unscheduled activities
          </h2>
          <p className="mt-1 text-sm text-muted">
            These activities have no date inside the trip range.
          </p>
          <div className="mt-4 space-y-2">
            {calendar.unscheduled.map(({ stop, activity }) => (
              <div key={activity.id} className="space-y-2">
                <CalendarActivityCard
                  item={activity}
                  currency={trip.currency}
                  cityName={stop.city?.name}
                  onEdit={() => {
                    setModalError("");
                    setEditing({ stop, item: activity });
                  }}
                />
                <button
                  type="button"
                  className="text-sm font-medium text-teal hover:text-teal-dark"
                  onClick={() => {
                    setModalError("");
                    setEditing({ stop, item: activity });
                  }}
                >
                  Schedule activity
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-sm text-muted">
        Need to change destinations?{" "}
        <Link className="font-medium text-teal" to={`/search/cities?tripId=${id}`}>
          Add destination
        </Link>
      </p>

      {editing ? (
        <AddActivityModal
          stop={editing.stop}
          initialItem={editing.item}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
          submitting={saving}
          error={modalError}
        />
      ) : null}
    </section>
  );
}
