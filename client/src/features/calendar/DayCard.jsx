import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { formatDateRange, formatWeekdayDate } from "../../lib/dates.js";
import CalendarActivityCard from "./CalendarActivityCard.jsx";
import EmptyDay from "./EmptyDay.jsx";
import ScheduleConflict from "./ScheduleConflict.jsx";

export default function DayCard({ day, tripId, currency, compact, onEditActivity }) {
  return (
    <article className="rounded-2xl border border-sand bg-white p-4 shadow-sm md:p-5">
      <h2 className="text-lg font-semibold">{formatWeekdayDate(day.date)}</h2>
      <ScheduleConflict conflicts={day.conflicts} />

      {day.stops.length === 0 ? (
        <div className="mt-4">
          <EmptyDay tripId={tripId} hasDestination={false} />
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {day.stops.map((stop) => (
            <div key={stop.id} className="rounded-xl border border-sand bg-cream/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    Destination
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 font-semibold">
                    <MapPin size={16} className="text-teal" />
                    {stop.city?.name}
                    {stop.city?.country ? `, ${stop.city.country}` : ""}
                  </h3>
                  <p className="text-sm text-muted">
                    {formatDateRange(stop.startDate, stop.endDate)}
                  </p>
                </div>
                <Link
                  to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-coral px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  <Plus size={14} />
                  Add activity
                </Link>
              </div>
              {stop.activities.length === 0 ? (
                <div className="mt-3">
                  <EmptyDay tripId={tripId} stop={stop} hasDestination />
                </div>
              ) : compact ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {stop.activities.map((item) => (
                    <li key={item.id}>
                      {(item.startTime || "—") +
                        (item.endTime ? `–${item.endTime}` : "")}{" "}
                      {item.customName || item.activity?.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 space-y-2">
                  {stop.activities.map((item) => (
                    <CalendarActivityCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      cityName={stop.city?.name}
                      onEdit={() => onEditActivity?.(stop, item)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
