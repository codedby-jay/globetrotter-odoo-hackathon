import { apiRequest } from "./api.js";

export function searchCities(q) {
  return apiRequest(`/search/cities?q=${encodeURIComponent(q)}`);
}

export function createStop(tripId, body) {
  return apiRequest(`/trips/${tripId}/stops`, { method: "POST", body });
}

export function updateStop(stopId, body) {
  return apiRequest(`/stops/${stopId}`, { method: "PATCH", body });
}

export function deleteStop(stopId) {
  return apiRequest(`/stops/${stopId}`, { method: "DELETE" });
}

export function reorderStops(tripId, stopIds) {
  return apiRequest(`/trips/${tripId}/stops/reorder`, {
    method: "PUT",
    body: { stopIds },
  });
}
