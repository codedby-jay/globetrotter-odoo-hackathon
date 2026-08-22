export default function SectionHeader({ title, action, className = "" }) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-3 ${className}`}>
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
