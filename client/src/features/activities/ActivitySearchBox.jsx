import { Search } from "lucide-react";
import { inputClassName } from "../../components/TripForm.jsx";

export default function ActivitySearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
      />
      <input
        className={`${inputClassName} pl-9`}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "Search activities..."}
      />
    </label>
  );
}
