export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  busyLabel,
  onConfirm,
  onCancel,
  busy,
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-sand"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? busyLabel || "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
