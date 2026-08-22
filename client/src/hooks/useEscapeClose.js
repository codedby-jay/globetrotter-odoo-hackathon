import { useEffect } from "react";

export default function useEscapeClose(onClose, enabled = true) {
  useEffect(() => {
    if (!enabled || !onClose) {
      return undefined;
    }
    function onKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, enabled]);
}
