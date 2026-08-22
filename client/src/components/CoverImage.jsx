import { useEffect, useState } from "react";

export default function CoverImage({ src, fallbackSrc, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setFallbackFailed(false);
  }, [src, fallbackSrc]);
  const next = failed && fallbackSrc && fallbackSrc !== src ? fallbackSrc : src;
  const url = failed && (fallbackFailed || !fallbackSrc || fallbackSrc === src) ? null : next;

  if (!url) {
    return <div className={`bg-navy ${className}`} aria-hidden />;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!failed) {
          setFailed(true);
          return;
        }
        setFallbackFailed(true);
      }}
    />
  );
}
