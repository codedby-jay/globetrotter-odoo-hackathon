export default function AuthFormCard({ title, description, children, footer }) {
  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      {description ? <p className="mb-6 text-sm text-muted">{description}</p> : null}
      {children}
      {footer ? <div className="mt-6 text-sm text-muted">{footer}</div> : null}
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

export const inputClassName =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-teal";

export const buttonClassName =
  "w-full rounded-lg bg-teal px-3 py-2.5 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60";
