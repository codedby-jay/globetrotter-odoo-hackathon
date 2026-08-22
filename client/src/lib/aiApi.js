import { apiRequest } from "./api.js";

export function getAiStatus() {
  return apiRequest("/ai/status");
}

export function chatTripAssistant(tripId, message) {
  return apiRequest(`/trips/${tripId}/ai/chat`, {
    method: "POST",
    body: { message },
  });
}

export function getTripSuggestions(tripId, preferences) {
  return apiRequest(`/trips/${tripId}/ai/suggestions`, {
    method: "POST",
    body: { preferences },
  });
}

export function analyzeTrip(tripId) {
  return apiRequest(`/trips/${tripId}/ai/analyze`, { method: "POST" });
}
