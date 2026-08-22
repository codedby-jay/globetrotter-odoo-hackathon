import { Link } from "react-router-dom";

const VARIANTS = {
  primary: "gt-btn gt-btn-primary",
  coral: "gt-btn gt-btn-coral",
  secondary: "gt-btn gt-btn-secondary",
  ghost: "gt-btn gt-btn-ghost",
  danger: "gt-btn gt-btn-danger",
};

export default function Button({
  variant = "primary",
  size,
  to,
  type = "button",
  className = "",
  disabled,
  loading,
  children,
  ...props
}) {
  const classes = [
    VARIANTS[variant] || VARIANTS.primary,
    size === "sm" ? "gt-btn-sm" : "",
    size === "lg" ? "gt-btn-lg" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = loading ? children : children;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
