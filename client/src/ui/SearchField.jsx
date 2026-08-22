import { Search } from "lucide-react";

export default function SearchField({
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <label className={`gt-search ${className}`.trim()}>
      <Search className="gt-search-icon" size={16} aria-hidden />
      <input
        className="gt-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        {...props}
      />
    </label>
  );
}
