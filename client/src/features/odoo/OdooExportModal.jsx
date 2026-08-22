export default function OdooExportModal({
  tripName,
  result,
  error,
  exporting,
  onConfirm,
  onClose,
}) {
  return (
    <div className="gt-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        className="gt-modal max-w-md"
      >
        <h2 className="text-lg font-semibold">Export trip to Odoo</h2>
        <p className="mt-2 text-sm text-muted">
          Send “{tripName}” to Odoo through the GlobeTrotter API. Odoo credentials stay on the
          server.
        </p>
        {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
        {result?.success ? (
          <div className="mt-3 rounded-xl bg-cream p-3 text-sm">
            <p className="font-medium text-teal">✓ Trip successfully exported to Odoo</p>
            {result.odoo?.recordId ? (
              <p className="mt-1 text-muted">Odoo Record ID: {result.odoo.recordId}</p>
            ) : null}
            {result.odoo?.model ? (
              <p className="text-muted">Model: {result.odoo.model}</p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand"
            onClick={onClose}
            disabled={exporting}
          >
            {result?.success ? "Close" : "Cancel"}
          </button>
          {result?.success ? null : (
            <button
              type="button"
              className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
              onClick={onConfirm}
              disabled={exporting}
            >
              {exporting ? "Exporting…" : "Export Trip to Odoo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
