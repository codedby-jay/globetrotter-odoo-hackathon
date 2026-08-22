import { apiRequest } from "./api.js";

export function createExpense(tripId, body) {
  return apiRequest(`/trips/${tripId}/expenses`, { method: "POST", body });
}

export function getTripExpenses(tripId) {
  return apiRequest(`/trips/${tripId}/expenses`);
}

export function updateExpense(expenseId, body) {
  return apiRequest(`/expenses/${expenseId}`, { method: "PATCH", body });
}

export function deleteExpense(expenseId) {
  return apiRequest(`/expenses/${expenseId}`, { method: "DELETE" });
}

export function getBudgetSummary(tripId) {
  return apiRequest(`/trips/${tripId}/budget`);
}
