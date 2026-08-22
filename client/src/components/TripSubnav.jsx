import { NavLink } from "react-router-dom";

export default function TripSubnav({ tripId }) {
  const items = [
    { to: `/trips/${tripId}`, label: "View", end: true },
    { to: `/trips/${tripId}/edit`, label: "Builder" },
    { to: `/search/cities?tripId=${tripId}`, label: "Destinations" },
    { to: `/trips/${tripId}/calendar`, label: "Calendar" },
    { to: `/trips/${tripId}/budget`, label: "Budget" },
    { to: `/trips/${tripId}/map`, label: "Map" },
    { to: `/trips/${tripId}/share`, label: "Share" },
    { to: `/trips/${tripId}/assistant`, label: "AI Assistant" },
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-teal text-white" : "bg-white text-muted hover:bg-sand",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
