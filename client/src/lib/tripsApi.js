import { apiRequest } from "./api.js";

export function listTrips(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest(`/trips${query}`);
}

export function createTrip(body) {
  return apiRequest("/trips", { method: "POST", body });
}

export function getTrip(id) {
  return apiRequest(`/trips/${id}`);
}

export function updateTrip(id, body) {
  return apiRequest(`/trips/${id}`, { method: "PATCH", body });
}

export function deleteTrip(id) {
  return apiRequest(`/trips/${id}`, { method: "DELETE" });
}
