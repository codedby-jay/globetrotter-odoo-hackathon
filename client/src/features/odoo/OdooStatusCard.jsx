export default function OdooStatusCard({
  status,
  loading,
  error,
  testing,
  onTest,
}) {
  const configured = Boolean(status?.configured);
  const connected = Boolean(status?.connected);

  let badge = "Not configured";
  let badgeClass = "bg-sand text-muted";
  if (configured && connected) {
    badge = "Connected to Odoo";
    badgeClass = "bg-teal/15 text-teal";
  } else if (configured) {
    badge = "Configured, not connected";
    badgeClass = "bg-coral/10 text-coral";
  }

  return (
    <div className="gt-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">Odoo Integration</p>
      <h2 className="mt-1 text-lg font-semibold">Connection status</h2>
      {loading ? (
        <p className="mt-3 text-sm text-muted">Checking Odoo…</p>
      ) : (
        <>
          <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
            {configured && connected ? "✓ " : ""}
            {badge}
          </p>
          {status?.message ? (
            <p className="mt-2 text-sm text-muted">{status.message}</p>
          ) : null}
        </>
      )}
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
      <button
        type="button"
        className="gt-btn gt-btn-primary mt-4"
        onClick={onTest}
        disabled={loading || testing}
      >
        {testing ? "Testing…" : "Test Connection"}
      </button>
    </div>
  );
}
