import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function ItineraryBuilderPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title="Itinerary Builder"
      description={`Stops, cities, and activities for trip ${id} will be implemented later.`}
    />
  );
}
