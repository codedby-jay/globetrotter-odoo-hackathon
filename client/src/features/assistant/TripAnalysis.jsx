const SEVERITY = {
  high: "text-coral",
  medium: "text-ink",
  low: "text-muted",
};

export default function TripAnalysis({ analysis }) {
  if (!analysis) {
    return null;
  }

  const issues = analysis.issues || [];

  return (
    <section className="space-y-3 rounded-2xl border border-sand bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Trip Insights</h2>
        {analysis.mode === "smart_analysis" ? (
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted">
            Smart Analysis Mode
          </span>
        ) : (
          <span className="rounded-full bg-teal/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-teal">
            AI assisted
          </span>
        )}
      </div>
      <p className="text-sm text-muted">{analysis.summary}</p>
      {issues.length === 0 ? (
        <p className="text-sm text-teal">✓ Budget is healthy</p>
      ) : (
        <ul className="space-y-2">
          {issues.map((issue, index) => (
            <li key={`${issue.type}-${index}`} className={`text-sm ${SEVERITY[issue.severity] || "text-ink"}`}>
              {issue.severity === "low" ? "• " : "⚠ "}
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
