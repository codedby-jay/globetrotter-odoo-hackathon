import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        clearStoredToken();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onExpired() {
      setUser(null);
    }
    window.addEventListener("globetrotter:session-expired", onExpired);
    return () => window.removeEventListener("globetrotter:session-expired", onExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async signup(payload) {
        const data = await apiRequest("/auth/signup", {
          method: "POST",
          body: payload,
        });
        storeToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async login(payload) {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: payload,
        });
        storeToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await apiRequest("/auth/logout", { method: "POST" });
        } catch {
          // Stateless JWT: still clear local session.
        }
        clearStoredToken();
        setUser(null);
      },
      async refresh() {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
        return data.user;
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
