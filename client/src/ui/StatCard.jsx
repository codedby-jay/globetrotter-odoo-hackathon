export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="gt-card p-4">
      <p className="gt-eyebrow flex items-center gap-1.5">
        {Icon ? <Icon size={13} aria-hidden /> : null}
        {label}
      </p>
      <p className="mt-2 break-words font-display text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </article>
  );
}
