export default function AIEmptyState({ configured }) {
  if (configured) {
    return (
      <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Ask anything about your trip</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-muted">
          Try a budget question, a city-specific idea, or run a smart itinerary analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-sand bg-white px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">AI Trip Assistant</p>
      <h2 className="mt-2 text-lg font-semibold">AI Assistant is not configured yet.</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
        AI features are currently unavailable. Configure the AI provider in server/.env. Smart analysis
        of budget, empty days, and conflicts still works on this page.
      </p>
    </div>
  );
}
