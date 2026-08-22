import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function CalendarPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title="Trip Calendar"
      description={`Calendar and timeline for trip ${id} will be implemented later.`}
    />
  );
}
