import { MapPin, Plus } from "lucide-react";
import { formatDateRange, formatWeekdayDate } from "../../lib/dates.js";
import CalendarActivityCard from "./CalendarActivityCard.jsx";
import EmptyDay from "./EmptyDay.jsx";
import ScheduleConflict from "./ScheduleConflict.jsx";
import Button from "../../ui/Button.jsx";

export default function DayCard({ day, tripId, currency, compact, onEditActivity }) {
  return (
    <article className="gt-card p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {formatWeekdayDate(day.date)}
        </h2>
      </div>
      <div className="mt-3">
        <ScheduleConflict conflicts={day.conflicts} />
      </div>

      {day.stops.length === 0 ? (
        <div className="mt-4">
          <EmptyDay tripId={tripId} hasDestination={false} />
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {day.stops.map((stop) => (
            <div key={stop.id} className="rounded-xl border border-line bg-cream/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="gt-eyebrow">Destination</p>
                  <h3 className="mt-1 flex items-center gap-2 font-semibold">
                    <MapPin size={16} className="text-teal" />
                    {stop.city?.name}
                    {stop.city?.country ? `, ${stop.city.country}` : ""}
                  </h3>
                  <p className="text-sm text-muted">
                    {formatDateRange(stop.startDate, stop.endDate)}
                  </p>
                </div>
                <Button
                  variant="coral"
                  size="sm"
                  to={`/search/activities?tripId=${tripId}&stopId=${stop.id}`}
                >
                  <Plus size={14} />
                  Add activity
                </Button>
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
