export default function AuthFormCard({ title, description, children, footer }) {
  return (
    <section className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="gt-eyebrow">GlobeTrotter</p>
        <h1 className="gt-title mt-2">{title}</h1>
        {description ? <p className="gt-lede mx-auto mt-3">{description}</p> : null}
      </div>
      <div className="gt-card p-6 md:p-8">
        {children}
        {footer ? <div className="mt-6 border-t border-line pt-5 text-sm text-muted">{footer}</div> : null}
      </div>
    </section>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-coral">{error}</span> : null}
    </label>
  );
}

export const inputClassName = "gt-input";

export const buttonClassName = "gt-btn gt-btn-primary gt-btn-lg w-full";
