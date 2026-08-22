import { Navigate, Route, Routes, useParams } from "react-router-dom";
import GuestRoute from "./components/GuestRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppShell from "./layouts/AppShell.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MyTripsPage from "./pages/MyTripsPage.jsx";
import CreateTripPage from "./pages/CreateTripPage.jsx";
import ItineraryViewPage from "./pages/ItineraryViewPage.jsx";
import ItineraryBuilderPage from "./pages/ItineraryBuilderPage.jsx";
import BudgetPage from "./pages/BudgetPage.jsx";
import TripCalendarPage from "./pages/TripCalendarPage.jsx";
import CitySearchPage from "./pages/search/CitySearchPage.jsx";
import ActivitySearchPage from "./pages/search/ActivitySearchPage.jsx";
import PublicItineraryPage from "./pages/share/PublicItineraryPage.jsx";
import ShareTripPage from "./pages/share/ShareTripPage.jsx";
import TripAssistantPage from "./pages/trips/TripAssistantPage.jsx";
import TripOdooPage from "./pages/trips/TripOdooPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function Guarded({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function RedirectLegacyAiPage() {
  const { id } = useParams();
  return <Navigate to={`/trips/${id}/assistant`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <Guarded>
              <DashboardPage />
            </Guarded>
          }
        />
        <Route
          path="/trips"
          element={
            <Guarded>
              <MyTripsPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/new"
          element={
            <Guarded>
              <CreateTripPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <Guarded>
              <ItineraryViewPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/edit"
          element={
            <Guarded>
              <ItineraryBuilderPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/budget"
          element={
            <Guarded>
              <BudgetPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/calendar"
          element={
            <Guarded>
              <TripCalendarPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/share"
          element={
            <Guarded>
              <ShareTripPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/ai"
          element={
            <Guarded>
              <RedirectLegacyAiPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/assistant"
          element={
            <Guarded>
              <TripAssistantPage />
            </Guarded>
          }
        />
        <Route
          path="/trips/:id/odoo"
          element={
            <Guarded>
              <TripOdooPage />
            </Guarded>
          }
        />
        <Route
          path="/search/cities"
          element={
            <Guarded>
              <CitySearchPage />
            </Guarded>
          }
        />
        <Route
          path="/search/activities"
          element={
            <Guarded>
              <ActivitySearchPage />
            </Guarded>
          }
        />
        <Route path="/p/:slug" element={<PublicItineraryPage />} />
        <Route
          path="/profile"
          element={
            <Guarded>
              <ProfilePage />
            </Guarded>
          }
        />
        <Route
          path="/admin"
          element={
            <Guarded>
              <AdminPage />
            </Guarded>
          }
        />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page not found"
              description="This route is not part of GlobeTrotter."
            />
          }
        />
      </Route>
    </Routes>
  );
}
