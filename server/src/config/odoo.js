const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 60_000;

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseTimeout(raw) {
  if (raw === undefined || raw === "" || raw === null) {
    return DEFAULT_TIMEOUT_MS;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEOUT_MS;
  }
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Math.trunc(parsed)));
}

/**
 * Read Odoo settings from the environment.
 * Missing values do not throw — the rest of the API still starts.
 */
export function getOdooConfig() {
  const url = trim(process.env.ODOO_URL).replace(/\/+$/, "");
  const db = trim(process.env.ODOO_DB);
  const username = trim(process.env.ODOO_USERNAME);
  const password = process.env.ODOO_PASSWORD ?? "";
  const timeoutMs = parseTimeout(process.env.ODOO_TIMEOUT_MS);
  const configured = Boolean(url && db && username && password);

  return {
    url,
    db,
    username,
    password,
    timeoutMs,
    configured,
  };
}

export function isOdooConfigured() {
  return getOdooConfig().configured;
}
