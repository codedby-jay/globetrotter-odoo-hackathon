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

export function explainApiError(error, fallback = "Something went wrong. Please try again.") {
  if (error instanceof TypeError) {
    return "Unable to connect to the server.";
  }
  if (!(error instanceof ApiError)) {
    return error?.message || fallback;
  }
  if (error.status === 401) {
    if (error.message && error.message !== "Request failed") {
      return error.message;
    }
    return "Your session has expired. Please log in again.";
  }
  if (error.status === 403) {
    return "You don't have permission to access this trip.";
  }
  if (error.status === 404) {
    return "Trip not found.";
  }
  if (error.status === 400) {
    const detail = error.details?.find((item) => item.message)?.message;
    if (error.message && error.message !== "Validation failed") {
      return error.message;
    }
    return detail || error.message || "Check the dates and try again.";
  }
  if (error.status >= 500) {
    return "Something went wrong. Please try again.";
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
  let payload = null;
  if (isJson) {
    payload = await response.json();
  } else {
    try {
      await response.text();
    } catch {
      // ignore empty bodies
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      clearStoredToken();
      window.dispatchEvent(new Event("globetrotter:session-expired"));
    }
    const fallback =
      !isJson && (response.status === 502 || response.status >= 500)
        ? "Unable to connect to the server. Start it with: cd server && npm run dev"
        : "Request failed";
    throw new ApiError(payload?.error || fallback, {
      status: response.status,
      details: payload?.details,
    });
  }

  return payload;
}
