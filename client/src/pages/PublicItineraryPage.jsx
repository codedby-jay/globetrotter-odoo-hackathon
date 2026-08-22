import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function PublicItineraryPage() {
  const { slug } = useParams();

  return (
    <PlaceholderPage
      title="Public Itinerary"
      description={`Read-only shared itinerary for ${slug} will be implemented later.`}
    />
  );
}
