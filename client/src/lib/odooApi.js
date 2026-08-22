import { apiRequest } from "./api.js";

export function getOdooStatus() {
  return apiRequest("/odoo/status");
}

export function testTripOdoo(tripId) {
  return apiRequest(`/trips/${tripId}/odoo/test`, { method: "POST" });
}

export function exportTripToOdoo(tripId) {
  return apiRequest(`/trips/${tripId}/odoo/export`, { method: "POST" });
}
