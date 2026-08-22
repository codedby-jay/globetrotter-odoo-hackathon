import { useEffect } from "react";
import Button from "../ui/Button.jsx";

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  busyLabel,
  onConfirm,
  onCancel,
  busy,
}) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape" && !busy) {
        onCancel?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="gt-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="gt-modal max-w-md"
      >
        <h2 id="confirm-dialog-title" className="font-display text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="coral" onClick={onConfirm} disabled={busy} loading={busy}>
            {busy ? busyLabel || "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
