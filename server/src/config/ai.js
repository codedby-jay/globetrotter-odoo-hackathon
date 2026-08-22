const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseTimeout(raw) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEOUT_MS;
  }
  return Math.min(60_000, Math.max(2_000, Math.trunc(parsed)));
}

/**
 * AI is optional. Missing values do not throw — GlobeTrotter still starts.
 */
export function getAiConfig() {
  const provider = trim(process.env.AI_PROVIDER).toLowerCase() || "";
  const apiKey = trim(process.env.AI_API_KEY);
  const model = trim(process.env.AI_MODEL) || DEFAULT_MODEL;
  const baseUrl = trim(process.env.AI_BASE_URL).replace(/\/+$/, "") || DEFAULT_BASE_URL;
  const timeoutMs = parseTimeout(process.env.AI_TIMEOUT_MS);
  const resolvedProvider = provider || (apiKey ? "openai" : "");
  const configured = Boolean(apiKey && (resolvedProvider === "openai" || resolvedProvider === "openai-compatible"));

  return {
    provider: resolvedProvider || null,
    apiKey,
    model,
    baseUrl,
    timeoutMs,
    configured,
  };
}

export function isAiConfigured() {
  return getAiConfig().configured;
}
