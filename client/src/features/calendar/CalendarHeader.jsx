import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatDateRange } from "../../lib/dates.js";
import Button from "../../ui/Button.jsx";

export default function CalendarHeader({
  trip,
  view,
  onViewChange,
  selectedDate,
  onPrev,
  onNext,
  onToday,
  canPrev,
  canNext,
  todayInRange,
}) {
  return (
    <div className="gt-card p-6 md:p-8">
      <p className="gt-eyebrow">Calendar</p>
      <h1 className="gt-title mt-2">{trip.name}</h1>
      <p className="gt-lede mt-2">{formatDateRange(trip.startDate, trip.endDate)}</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 rounded-xl bg-sand p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              view === "day" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
            onClick={() => onViewChange("day")}
          >
            Day
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              view === "all" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
            onClick={() => onViewChange("all")}
          >
            All days
          </button>
        </div>

        {view === "day" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onPrev} disabled={!canPrev}>
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={onToday} disabled={!todayInRange}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={onNext} disabled={!canNext}>
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        ) : null}
      </div>
      {view === "day" ? (
        <p className="mt-3 text-sm text-muted">Showing {formatDate(selectedDate)}</p>
      ) : null}
    </div>
  );
}
