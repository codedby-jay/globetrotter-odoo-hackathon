export default function PlaceholderPage({ title, description }) {
  return (
    <section className="gt-card p-6 md:p-8">
      <p className="gt-eyebrow">Coming soon</p>
      <h1 className="gt-title mt-2">{title}</h1>
      <p className="gt-lede mt-3">{description}</p>
    </section>
  );
}
