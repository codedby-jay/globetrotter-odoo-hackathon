export default function Alert({ tone = "error", children, className = "" }) {
  if (!children) {
    return null;
  }
  const cls = tone === "success" ? "gt-alert gt-alert-success" : "gt-alert gt-alert-error";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`${cls} ${className}`}>
      {children}
    </p>
  );
}
