export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="gt-card px-6 py-12 text-center">
      {Icon ? (
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
          <Icon size={22} aria-hidden />
        </span>
      ) : null}
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
