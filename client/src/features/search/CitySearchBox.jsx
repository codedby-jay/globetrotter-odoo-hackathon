import SearchField from "../../ui/SearchField.jsx";

export default function CitySearchBox({ value, onChange, placeholder }) {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Where do you want to go?"}
    />
  );
}
