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
    <section className="gt-card space-y-3 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight">Trip insights</h2>
        {analysis.mode === "smart_analysis" ? (
          <span className="gt-chip bg-sand text-muted">Smart Analysis Mode</span>
        ) : (
          <span className="gt-chip">AI assisted</span>
        )}
      </div>
      <p className="text-sm text-muted">{analysis.summary}</p>
      {issues.length === 0 ? (
        <p className="text-sm text-teal">Budget is healthy</p>
      ) : (
        <ul className="space-y-2">
          {issues.map((issue, index) => (
            <li key={`${issue.type}-${index}`} className={`text-sm ${SEVERITY[issue.severity] || "text-ink"}`}>
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
