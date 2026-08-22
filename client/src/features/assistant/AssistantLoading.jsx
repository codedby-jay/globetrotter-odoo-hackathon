export default function AssistantLoading({ label = "Analyzing your trip…" }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sand border-t-teal" />
      {label}
    </p>
  );
}
