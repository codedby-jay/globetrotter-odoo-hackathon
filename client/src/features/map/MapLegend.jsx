export default function MapLegend({ count, skipped }) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[400] max-w-xs rounded-xl bg-white/95 px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-teal">Trip route</p>
      <p className="text-muted">
        Visual connection of {count} itinerary {count === 1 ? "destination" : "destinations"} — not a
        driving or navigation route.
      </p>
      {skipped > 0 ? (
        <p className="mt-1 text-coral">
          Some destinations cannot be displayed on the map because coordinates are unavailable.
        </p>
      ) : null}
    </div>
  );
}
