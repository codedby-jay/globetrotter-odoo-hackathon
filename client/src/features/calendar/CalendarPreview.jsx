import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { calendarSummary } from "../../lib/calendar.js";
import { activityLabel, formatTimeDisplay } from "../../lib/dates.js";

export default function CalendarPreview({ trip }) {
  if (!trip) {
    return null;
  }
  const summary = calendarSummary(trip);
  const nextName = summary.next ? activityLabel(summary.next) : null;
  const nextTime = summary.next?.startTime
    ? formatTimeDisplay(summary.next.startTime) || summary.next.startTime
    : null;

  return (
    <section className="rounded-2xl border border-sand bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CalendarDays size={18} className="text-teal" />
          Upcoming
        </h2>
        <Link
          to={`/trips/${trip.id}/calendar`}
          className="text-sm font-medium text-teal hover:text-teal-dark"
        >
          View calendar
        </Link>
      </div>
      <p className="mt-3 text-sm">
        {summary.isToday ? "Today" : "Next trip day"}: {summary.activityCount}{" "}
        {summary.activityCount === 1 ? "activity" : "activities"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {nextName
          ? `Next: ${nextName}${nextTime ? ` — ${nextTime}` : ""}`
          : "No upcoming activities yet."}
      </p>
    </section>
  );
}
