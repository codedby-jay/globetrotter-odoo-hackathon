import { apiRequest } from "./api.js";

export function getAssistantStatus() {
  return apiRequest("/assistant/status");
}

export function analyzeTripAssistant(tripId) {
  return apiRequest(`/trips/${tripId}/assistant/analyze`, { method: "POST" });
}

export function getAssistantSuggestions(tripId, preferences) {
  return apiRequest(`/trips/${tripId}/assistant/suggestions`, {
    method: "POST",
    body: { preferences },
  });
}

export function chatAssistant(tripId, message) {
  return apiRequest(`/trips/${tripId}/assistant/chat`, {
    method: "POST",
    body: { message },
  });
}
