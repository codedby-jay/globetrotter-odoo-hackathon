import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function BudgetPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title="Trip Budget"
      description={`Cost breakdown and charts for trip ${id} will be implemented later.`}
    />
  );
}
