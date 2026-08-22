import { getAiConfig } from "../config/ai.js";
import { HttpError } from "../lib/httpError.js";

const SAFE_MESSAGES = {
  notConfigured: "AI is not configured",
  timeout: "The AI provider did not respond in time",
  unavailable: "The AI provider is unavailable",
  malformed: "The AI provider returned an unexpected response",
  auth: "AI authentication failed",
};

function redact(text, secret) {
  if (!text || !secret) {
    return text;
  }
  return String(text).split(secret).join("[redacted]");
}

function publicError(kind, config, raw) {
  const message = SAFE_MESSAGES[kind] || SAFE_MESSAGES.unavailable;
  if (raw) {
    console.error(`[ai] ${kind}: ${redact(String(raw), config.apiKey).slice(0, 300)}`);
  }
  return new HttpError(502, message);
}

export function getAiStatus() {
  const config = getAiConfig();
  return {
    configured: config.configured,
    provider: config.configured ? config.provider : null,
    model: config.configured ? config.model : null,
    message: config.configured
      ? "AI assistant is configured"
      : "AI Assistant is not configured yet.",
  };
}

/**
 * Provider-agnostic text generation. Currently OpenAI Chat Completions
 * (also works with OpenAI-compatible gateways via AI_BASE_URL).
 */
export async function generateText(prompt, options = {}) {
  const config = getAiConfig();
  if (!config.configured) {
    const error = new HttpError(400, SAFE_MESSAGES.notConfigured);
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }

  const system = options.system || "You are a helpful travel planning assistant.";
  const json = Boolean(options.json);
  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.4;
  const maxTokens = options.maxTokens || 900;

  let response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      throw publicError("timeout", config, err.message);
    }
    throw publicError("unavailable", config, err.message);
  }

  if (response.status === 401 || response.status === 403) {
    throw publicError("auth", config, `HTTP ${response.status}`);
  }
  if (!response.ok) {
    throw publicError("unavailable", config, `HTTP ${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw publicError("malformed", config);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw publicError("malformed", config, "empty completion");
  }

  return text.trim();
}

export function parseJsonContent(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new HttpError(502, SAFE_MESSAGES.malformed);
  }
}
