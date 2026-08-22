import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
import Button from "../ui/Button.jsx";
import UserAvatar from "../components/UserAvatar.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: MapPinned },
  { to: "/search/cities", label: "Cities", icon: Compass },
  { to: "/search/activities", label: "Activities", icon: Search },
  { to: "/profile", label: "Profile", icon: UserRound },
];

function linkClass({ isActive }) {
  return [
    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-teal-soft text-teal-dark" : "text-muted hover:bg-sand hover:text-ink",
  ].join(" ");
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(
    pathname,
  );

  return (
    <div className="min-h-svh text-ink">
      <header className="gt-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to={user ? "/" : "/login"} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#1a7a72,#0d5757)] font-display text-sm font-semibold text-white shadow-sm">
              GT
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">GlobeTrotter</span>
          </NavLink>

          {user ? (
            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end className={linkClass}>
                  <Icon size={16} aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="hidden items-center gap-3 md:flex">
            {loading ? null : user ? (
              <>
                <Button variant="coral" size="sm" to="/trips/new">
                  Plan trip
                </Button>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-full border px-2 py-1 pr-3 no-underline",
                      isActive ? "border-teal bg-teal-soft" : "border-line bg-cream",
                    ].join(" ")
                  }
                  aria-label="Open profile"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="max-w-36 truncate text-sm font-medium text-ink">{user.name}</span>
                </NavLink>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" to="/login">
                  Log in
                </Button>
                <Button variant="coral" to="/signup">
                  Sign up
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:contents">
          {user ? (
            <NavLink
              to="/profile"
              className="inline-flex shrink-0 md:hidden"
              aria-label="Open profile"
            >
              <UserAvatar user={user} size="sm" />
            </NavLink>
          ) : null}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-sand md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="space-y-1 border-t border-line px-4 py-3 md:hidden" aria-label="Mobile">
            {user
              ? navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
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
                className="gt-btn gt-btn-ghost w-full justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Log out
              </button>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="gt-btn gt-btn-coral w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        ) : null}
      </header>

      <main
        className={
          isAuthRoute
            ? "w-full min-w-0"
            : "mx-auto w-full min-w-0 max-w-6xl px-4 py-8 md:py-10"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
