export default function Card({ as: Tag = "div", hover = false, className = "", children, ...props }) {
  return (
    <Tag className={["gt-card", hover ? "gt-card-hover" : "", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Tag>
  );
}
