import { useEffect, useState } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapLegend from "./MapLegend.jsx";
import MapMarker from "./MapMarker.jsx";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "../../lib/map.js";

function MapViewport({ stops, selectedId }) {
  const map = useMap();
  const fitKey = stops.map((stop) => `${stop.id}:${stop.lat}:${stop.lng}`).join("|");

  useEffect(() => {
    if (!stops.length) {
      return;
    }
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 10, { animate: false });
      return;
    }
    const bounds = stops.map((stop) => [stop.lat, stop.lng]);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 10, animate: false });
  }, [map, fitKey, stops]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const stop = stops.find((item) => item.id === selectedId);
    if (!stop) {
      return;
    }
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 8), { duration: 0.45 });
  }, [map, selectedId, stops]);

  return null;
}

export default function TripMap({ stops, skippedCount, selectedId, onSelect, tripId }) {
  const [mounted, setMounted] = useState(false);
  const center = stops[0] ? [stops[0].lat, stops[0].lng] : [20, 0];
  const line = stops.map((stop) => [stop.lat, stop.lng]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-[420px] w-full max-w-full overflow-hidden rounded-2xl border border-sand bg-sand md:h-[560px]">
        <p className="p-4 text-sm text-muted">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full max-w-full overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:h-[560px]">
      <MapContainer
        center={center}
        zoom={stops.length === 1 ? 10 : 4}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <MapViewport stops={stops} selectedId={selectedId} />
        {line.length > 1 ? (
          <Polyline
            positions={line}
            pathOptions={{ color: "#0f6c6c", weight: 3, opacity: 0.85 }}
          />
        ) : null}
        {stops.map((stop) => (
          <MapMarker
            key={stop.id}
            stop={stop}
            tripId={tripId}
            selected={stop.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>
      <MapLegend count={stops.length} skipped={skippedCount} />
    </div>
  );
}
