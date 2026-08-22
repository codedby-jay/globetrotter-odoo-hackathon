import { apiRequest } from "./api.js";

export function getPublicTrip(slug) {
  return apiRequest(`/public/trips/${encodeURIComponent(slug)}`);
}

export function copyPublicTrip(slug) {
  return apiRequest(`/public/trips/${encodeURIComponent(slug)}/copy`, {
    method: "POST",
  });
}

export function updateTripVisibility(tripId, visibility) {
  return apiRequest(`/trips/${tripId}/visibility`, {
    method: "PATCH",
    body: { visibility },
  });
}

export function recordShareEvent(tripId) {
  return apiRequest(`/trips/${tripId}/share-events`, {
    method: "POST",
    body: { event: "SHARE" },
  });
}

export function publicTripPath(slug) {
  return `/p/${slug}`;
}

export function publicTripUrl(slug) {
  if (typeof window === "undefined") {
    return `/p/${slug}`;
  }
  return `${window.location.origin}/p/${slug}`;
}
