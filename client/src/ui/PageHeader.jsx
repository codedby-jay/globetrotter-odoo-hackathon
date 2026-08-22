export default function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <header className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className="gt-eyebrow">{eyebrow}</p> : null}
        <h1 className="gt-title">{title}</h1>
        {description ? <p className="gt-lede">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
