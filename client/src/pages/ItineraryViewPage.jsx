import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function ItineraryViewPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title="Itinerary View"
      description={`Day-wise itinerary for trip ${id} will be implemented later.`}
    />
  );
}
