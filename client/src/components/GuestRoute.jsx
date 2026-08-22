import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { safeNextPath } from "../lib/navigation.js";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"), "/");

  if (loading) {
    return (
      <p className="text-sm text-muted" role="status">
        Checking your session…
      </p>
    );
  }

  if (user) {
    return <Navigate to={nextPath} replace />;
  }

  return children;
}
