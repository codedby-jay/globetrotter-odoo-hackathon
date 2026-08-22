import { Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MyTripsPage from "./pages/MyTripsPage.jsx";
import CreateTripPage from "./pages/CreateTripPage.jsx";
import ItineraryViewPage from "./pages/ItineraryViewPage.jsx";
import ItineraryBuilderPage from "./pages/ItineraryBuilderPage.jsx";
import BudgetPage from "./pages/BudgetPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import CitySearchPage from "./pages/CitySearchPage.jsx";
import ActivitySearchPage from "./pages/ActivitySearchPage.jsx";
import PublicItineraryPage from "./pages/PublicItineraryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/trips/:id" element={<ItineraryViewPage />} />
        <Route path="/trips/:id/edit" element={<ItineraryBuilderPage />} />
        <Route path="/trips/:id/budget" element={<BudgetPage />} />
        <Route path="/trips/:id/calendar" element={<CalendarPage />} />
        <Route path="/search/cities" element={<CitySearchPage />} />
        <Route path="/search/activities" element={<ActivitySearchPage />} />
        <Route path="/p/:slug" element={<PublicItineraryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page not found"
              description="This route is not part of the GlobeTrotter foundation."
            />
          }
        />
      </Route>
    </Routes>
  );
}
