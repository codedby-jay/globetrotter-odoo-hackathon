import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOdooStatus } from "../lib/odooApi.js";

const ODOO_CACHE_KEY = "gt_odoo_configured";

export default function TripSubnav({ tripId }) {
  const location = useLocation();
  const [showOdoo, setShowOdoo] = useState(() => sessionStorage.getItem(ODOO_CACHE_KEY) === "1");

  useEffect(() => {
    const cached = sessionStorage.getItem(ODOO_CACHE_KEY);
    if (cached === "1" || cached === "0") {
      setShowOdoo(cached === "1");
      return undefined;
    }
    let cancelled = false;
    getOdooStatus()
      .then((status) => {
        const configured = Boolean(status?.configured);
        sessionStorage.setItem(ODOO_CACHE_KEY, configured ? "1" : "0");
        if (!cancelled) {
          setShowOdoo(configured);
        }
      })
      .catch(() => {
        sessionStorage.setItem(ODOO_CACHE_KEY, "0");
        if (!cancelled) {
          setShowOdoo(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { to: `/trips/${tripId}`, label: "View", end: true },
    { to: `/trips/${tripId}/edit`, label: "Builder" },
    {
      to: `/search/cities?tripId=${tripId}`,
      label: "Destinations",
      isActive: () =>
        location.pathname === "/search/cities" &&
        new URLSearchParams(location.search).get("tripId") === tripId,
    },
    { to: `/trips/${tripId}/calendar`, label: "Calendar" },
    { to: `/trips/${tripId}/budget`, label: "Budget" },
    { to: `/trips/${tripId}/map`, label: "Map" },
    { to: `/trips/${tripId}/share`, label: "Share" },
    { to: `/trips/${tripId}/assistant`, label: "AI Assistant" },
  ];

  if (showOdoo) {
    items.push({ to: `/trips/${tripId}/odoo`, label: "Odoo" });
  }

  return (
    <nav
      className="-mx-1 flex flex-nowrap gap-1 overflow-x-auto border-b border-line px-1 pb-px [scrollbar-width:thin]"
      aria-label="Trip sections"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => {
            const active = item.isActive ? item.isActive() : isActive;
            return [
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-teal text-teal-dark"
                : "border-transparent text-muted hover:text-ink",
            ].join(" ");
          }}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
