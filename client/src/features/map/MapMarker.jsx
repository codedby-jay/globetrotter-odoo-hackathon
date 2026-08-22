import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MapPopup from "./MapPopup.jsx";

function numberedIcon(order, active) {
  return L.divIcon({
    className: "gt-map-marker",
    html: `<div class="gt-map-pin ${active ? "gt-map-pin-active" : ""}">${order}</div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}

export default function MapMarker({ stop, tripId, selected, onSelect }) {
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return undefined;
    }
    if (selected) {
      marker.openPopup();
    }
    return undefined;
  }, [selected]);

  return (
    <Marker
      ref={markerRef}
      position={[stop.lat, stop.lng]}
      icon={numberedIcon(stop.order, selected)}
      eventHandlers={{
        click: () => onSelect(stop.id),
      }}
    >
      <Popup>
        <MapPopup stop={stop} tripId={tripId} />
      </Popup>
    </Marker>
  );
}
