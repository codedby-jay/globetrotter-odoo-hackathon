export default function Badge({ children, tone = "teal", className = "" }) {
  const tones = {
    teal: "gt-chip",
    muted: "gt-chip bg-sand text-muted",
    coral: "gt-chip bg-[rgba(212,90,60,0.1)] text-coral",
  };
  return <span className={`${tones[tone] || tones.teal} ${className}`}>{children}</span>;
}
