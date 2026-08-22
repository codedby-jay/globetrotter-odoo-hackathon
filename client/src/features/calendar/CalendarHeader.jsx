import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateRange } from "../../lib/dates.js";

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
    <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">Calendar</p>
      <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{trip.name}</h1>
      <p className="mt-2 text-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              view === "day" ? "bg-teal text-white" : "bg-cream text-muted hover:bg-sand"
            }`}
            onClick={() => onViewChange("day")}
          >
            Day View
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              view === "all" ? "bg-teal text-white" : "bg-cream text-muted hover:bg-sand"
            }`}
            onClick={() => onViewChange("all")}
          >
            All Days
          </button>
        </div>

        {view === "day" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand disabled:opacity-40"
              onClick={onPrev}
              disabled={!canPrev}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg bg-cream px-3 py-1.5 text-sm font-medium hover:bg-sand disabled:opacity-40"
              onClick={onToday}
              disabled={!todayInRange}
            >
              Today
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-sm hover:bg-sand disabled:opacity-40"
              onClick={onNext}
              disabled={!canNext}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
      {view === "day" ? (
        <p className="mt-3 text-sm text-muted">Showing {selectedDate}</p>
      ) : null}
    </div>
  );
}
