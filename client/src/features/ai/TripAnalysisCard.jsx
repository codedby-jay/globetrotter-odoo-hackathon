const SEVERITY = {
  high: "text-coral",
  medium: "text-ink",
  low: "text-muted",
};

export default function TripAnalysisCard({ analysis }) {
  if (!analysis) {
    return null;
  }

  const issues = analysis.issues || [];
  const healthy = issues.length === 0;

  return (
    <section className="space-y-3 rounded-2xl border border-sand bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Trip Analysis</h2>
        {analysis.source === "smart_analysis" ? (
          <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">Smart analysis</span>
        ) : null}
      </div>
      <p className="text-sm text-muted">{analysis.overall}</p>
      {healthy ? (
        <p className="text-sm text-teal">✓ Budget and schedule look healthy</p>
      ) : (
        <ul className="space-y-2">
          {issues.map((issue, index) => (
            <li key={`${issue.type}-${index}`} className={`text-sm ${SEVERITY[issue.severity] || "text-ink"}`}>
              {issue.severity === "high" ? "⚠ " : issue.severity === "low" ? "• " : "⚠ "}
              {issue.message}
            </li>
          ))}
        </ul>
      )}
      {(analysis.suggestions || []).length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {analysis.suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
