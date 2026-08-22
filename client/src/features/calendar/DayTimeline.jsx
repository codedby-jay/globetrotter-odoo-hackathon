import DayCard from "./DayCard.jsx";

export default function DayTimeline({ days, tripId, currency, compact, onEditActivity }) {
  return (
    <div className="space-y-4">
      {days.map((day) => (
        <DayCard
          key={day.date}
          day={day}
          tripId={tripId}
          currency={currency}
          compact={compact}
          onEditActivity={onEditActivity}
        />
      ))}
    </div>
  );
}
