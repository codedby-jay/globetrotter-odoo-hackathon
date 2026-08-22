export default function PageLoader({ label = "Loading…" }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-4 w-28 animate-pulse rounded-full bg-sand" />
      <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-sand" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-44 animate-pulse rounded-2xl bg-sand" />
        <div className="h-44 animate-pulse rounded-2xl bg-sand" />
        <div className="hidden h-44 animate-pulse rounded-2xl bg-sand lg:block" />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
