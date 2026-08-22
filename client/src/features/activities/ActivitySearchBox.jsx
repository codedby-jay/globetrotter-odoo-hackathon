import SearchField from "../../ui/SearchField.jsx";

export default function ActivitySearchBox({ value, onChange, placeholder }) {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Search activities..."}
    />
  );
}
