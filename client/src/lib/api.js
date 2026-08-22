export const TOKEN_STORAGE_KEY = "globetrotter_access_token";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function explainApiError(error, fallback = "Something went wrong") {
  if (error instanceof TypeError) {
    return "Network error. Check your connection and try again.";
  }
  if (!(error instanceof ApiError)) {
    return error?.message || fallback;
  }
  if (error.status === 401) {
    return "Please log in to continue.";
  }
  if (error.status === 403) {
    return "You do not have access to this trip.";
  }
  if (error.status === 404) {
    return error.message || "That trip could not be found.";
  }
  if (error.status === 400) {
    const detail = error.details?.find((item) => item.message)?.message;
    if (error.message && error.message !== "Validation failed") {
      return error.message;
    }
    return detail || error.message || "Check the dates and try again.";
  }
  if (error.status === 502) {
    return error.message || "The assistant is unavailable. Try again later.";
  }
  if (error.status >= 500) {
    return "The server is unavailable. Please try again shortly.";
  }
  return error.message || fallback;
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {
    Accept: "application/json",
  };

  const accessToken = token ?? getStoredToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api/v1${path}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.error || "Request failed", {
      status: response.status,
      details: payload?.details,
    });
  }

  return payload;
}
