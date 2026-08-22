import { getOdooConfig } from "../config/odoo.js";
import { HttpError } from "../lib/httpError.js";

const SAFE_ODOO_MESSAGES = {
  timeout: "Odoo did not respond in time",
  unavailable: "Odoo is unavailable",
  auth: "Odoo authentication failed",
  database: "Odoo database is invalid or unreachable",
  malformed: "Odoo returned an unexpected response",
  notConfigured: "Odoo is not configured",
};

function sanitizeForLogs(value, secrets) {
  if (typeof value !== "string") {
    return value;
  }
  let next = value;
  for (const secret of secrets) {
    if (secret && next.includes(secret)) {
      next = next.split(secret).join("[redacted]");
    }
  }
  return next;
}

function secretList(config) {
  return [config.password, config.username].filter(Boolean);
}

function publicOdooError(kind, config, rawMessage) {
  const message = SAFE_ODOO_MESSAGES[kind] || SAFE_ODOO_MESSAGES.unavailable;
  if (rawMessage) {
    const safe = sanitizeForLogs(String(rawMessage), secretList(config));
    if (safe && safe !== config.password) {
      console.error(`[odoo] ${kind}: ${safe.slice(0, 300)}`);
    }
  }
  return new HttpError(502, message);
}

function classifyOdooFault(text) {
  const lower = String(text || "").toLowerCase();
  if (
    lower.includes("database") &&
    (lower.includes("not found") || lower.includes("does not exist") || lower.includes("invalid"))
  ) {
    return "database";
  }
  if (
    lower.includes("access denied") ||
    lower.includes("wrong login") ||
    lower.includes("authentication") ||
    lower.includes("invalid credentials")
  ) {
    return "auth";
  }
  return "unavailable";
}

export class OdooClient {
  constructor(config = getOdooConfig()) {
    this.config = config;
    this.uid = null;
  }

  requireConfigured() {
    if (!this.config.configured) {
      throw new HttpError(400, SAFE_ODOO_MESSAGES.notConfigured);
    }
  }

  jsonRpcUrl() {
    return `${this.config.url}/jsonrpc`;
  }

  async call(service, method, args = []) {
    this.requireConfigured();

    let response;
    try {
      response = await fetch(this.jsonRpcUrl(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: { service, method, args },
          id: Date.now(),
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
    } catch (err) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        throw publicOdooError("timeout", this.config, err.message);
      }
      throw publicOdooError("unavailable", this.config, err.message);
    }

    if (!response.ok) {
      throw publicOdooError("unavailable", this.config, `HTTP ${response.status}`);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw publicOdooError("malformed", this.config);
    }

    if (!payload || typeof payload !== "object") {
      throw publicOdooError("malformed", this.config);
    }

    if (payload.error) {
      const data = payload.error.data || {};
      const fault = data.message || payload.error.message || "Odoo error";
      throw publicOdooError(classifyOdooFault(fault), this.config, fault);
    }

    return payload.result;
  }

  async authenticate() {
    this.requireConfigured();
    const result = await this.call("common", "authenticate", [
      this.config.db,
      this.config.username,
      this.config.password,
      {},
    ]);

    if (result === false || result === null || result === undefined) {
      throw publicOdooError("auth", this.config);
    }

    const uid = Number(result);
    if (!Number.isInteger(uid) || uid <= 0) {
      throw publicOdooError("malformed", this.config, "authenticate returned a non-uid value");
    }

    this.uid = uid;
    return uid;
  }

  async ensureUid() {
    if (Number.isInteger(this.uid) && this.uid > 0) {
      return this.uid;
    }
    return this.authenticate();
  }

  async executeKw(model, method, positional = [], kwargs = {}) {
    const uid = await this.ensureUid();
    const args = [
      this.config.db,
      uid,
      this.config.password,
      model,
      method,
      positional,
    ];
    if (kwargs && Object.keys(kwargs).length > 0) {
      args.push(kwargs);
    }
    return this.call("object", "execute_kw", args);
  }

  search(model, domain = [], options = {}) {
    return this.executeKw(model, "search", [domain], options);
  }

  read(model, ids, fields = []) {
    const idList = Array.isArray(ids) ? ids : [ids];
    return this.executeKw(model, "read", [idList, fields]);
  }

  create(model, values) {
    return this.executeKw(model, "create", [values]);
  }

  write(model, ids, values) {
    const idList = Array.isArray(ids) ? ids : [ids];
    return this.executeKw(model, "write", [idList, values]);
  }

  async version() {
    this.requireConfigured();
    return this.call("common", "version", []);
  }
}

export function createOdooClient(config = getOdooConfig()) {
  return new OdooClient(config);
}
