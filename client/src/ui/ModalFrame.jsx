import useEscapeClose from "../hooks/useEscapeClose.js";

export default function ModalFrame({
  title,
  description,
  onClose,
  children,
  busy,
  labelledBy = "gt-modal-title",
}) {
  useEscapeClose(onClose, !busy);

  return (
    <div
      className="gt-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="gt-modal max-w-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={labelledBy} className="font-display text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button type="button" className="gt-btn gt-btn-ghost gt-btn-sm" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
