export default function PlaceholderPage({ title, description }) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-6 shadow-sm md:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
        Placeholder
      </p>
      <h1 className="mb-3 text-2xl font-semibold md:text-3xl">{title}</h1>
      <p className="max-w-2xl text-muted">{description}</p>
    </section>
  );
}
