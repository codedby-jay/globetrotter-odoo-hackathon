import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  MapPinned,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: MapPinned },
  { to: "/search/cities", label: "Cities", icon: Compass },
  { to: "/search/activities", label: "Activities", icon: Search },
  { to: "/profile", label: "Profile", icon: UserRound },
];

function linkClass({ isActive }) {
  return [
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-teal text-white"
      : "text-ink/80 hover:bg-sand hover:text-teal-dark",
  ].join(" ");
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  return (
    <div className="min-h-svh bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-sand bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white">
              GT
            </span>
            <span>GlobeTrotter</span>
          </NavLink>

          {user ? (
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"} className={linkClass}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="hidden items-center gap-2 md:flex">
            {loading ? null : user ? (
              <>
                <span className="max-w-40 truncate text-sm text-muted">{user.name}</span>
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-sand"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen ? (
          <nav className="space-y-1 border-t border-sand px-4 py-3 md:hidden">
            {user
              ? navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={linkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))
              : null}
            {user ? (
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-sand"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Log out
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="flex items-center rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
