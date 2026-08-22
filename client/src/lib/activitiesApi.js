import { apiRequest } from "./api.js";

export function searchActivities(cityId, q = "") {
  const params = new URLSearchParams({ cityId });
  if (q.trim()) {
    params.set("q", q.trim());
  }
  return apiRequest(`/search/activities?${params.toString()}`);
}

export function listStopActivities(stopId) {
  return apiRequest(`/stops/${stopId}/activities`);
}

export function createStopActivity(stopId, body) {
  return apiRequest(`/stops/${stopId}/activities`, { method: "POST", body });
}

export function updateStopActivity(id, body) {
  return apiRequest(`/stop-activities/${id}`, { method: "PATCH", body });
}

export function deleteStopActivity(id) {
  return apiRequest(`/stop-activities/${id}`, { method: "DELETE" });
}

export function reorderStopActivities(stopId, stopActivityIds) {
  return apiRequest(`/stops/${stopId}/activities/reorder`, {
    method: "PUT",
    body: { stopActivityIds },
  });
}
