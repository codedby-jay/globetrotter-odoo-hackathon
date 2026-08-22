import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { isAiConfigured } from "../config/ai.js";
import { getAiStatus } from "../providers/aiProvider.js";
import { ensureCityActivityCatalog } from "../providers/activitySearch.js";
import {
  analyzeTrip as analyzeTripWithOptionalAi,
  analyzeTripContext,
  askTripAssistant,
  buildSmartChatResponse,
  catalogSuggestions,
  getTripContext,
} from "./aiTripService.js";

function modeFromSource(source) {
  return source === "ai" ? "ai" : "smart_analysis";
}

function healthFrom(context, issues) {
  const trip = context.raw.trip;
  const calendar = context.raw.calendar;
  const activityCount = (trip.stops || []).reduce(
    (sum, stop) => sum + (stop.activities || []).length,
    0,
  );
  return {
    tripDays: calendar.days.length,
    destinations: (trip.stops || []).length,
    activities: activityCount,
    warnings: issues.length,
  };
}

function budgetBlock(context) {
  const budget = context.budget;
  return {
    limit: budget.budgetLimit,
    spent: budget.totalSpent,
    remaining: budget.remaining,
    percentage: budget.percentageUsed,
    currency: budget.currency,
    overBudget: budget.overBudget,
  };
}

export { getTripContext };

export async function analyzeTrip(tripId, userId) {
  const context = await getTripContext(tripId, userId);
  const computed = analyzeTripContext(context);
  let issues = computed.issues;
  let textSuggestions = computed.suggestions;
  let summary = computed.overall;
  let source = "smart_analysis";

  if (isAiConfigured()) {
    try {
      const polished = await analyzeTripWithOptionalAi(tripId, userId);
      summary = polished.overall || summary;
      issues = polished.issues?.length ? polished.issues : issues;
      textSuggestions = polished.suggestions?.length ? polished.suggestions : textSuggestions;
      source = polished.source || source;
    } catch {
      source = "smart_analysis";
    }
  }

  const catalog = catalogSuggestions(context, {
    style: "balanced",
    interests: ["culture", "food", "nature"],
  });

  return {
    summary,
    budget: budgetBlock(context),
    health: healthFrom(context, issues),
    issues,
    suggestions: textSuggestions,
    recommendations: catalog.recommendations,
    mode: modeFromSource(source),
    source,
  };
}

export async function generateSuggestions(tripId, userId, preferences = {}) {
  const context = await getTripContext(tripId, userId);
  const { trip, calendar } = context.raw;

  for (const stop of trip.stops || []) {
    if (stop.city) {
      await ensureCityActivityCatalog(stop.city);
    }
  }

  const cityIds = (trip.stops || []).map((stop) => stop.city?.id).filter(Boolean);
  const stored =
    cityIds.length === 0
      ? []
      : await prisma.activity.findMany({
          where: { cityId: { in: cityIds } },
          include: { city: true },
          orderBy: { popularity: "desc" },
        });

  const INTEREST_TYPES = {
    culture: "CULTURE",
    food: "FOOD",
    nature: "NATURE",
    sightseeing: "SIGHTSEEING",
    adventure: "ADVENTURE",
    shopping: "SHOPPING",
    nightlife: "NIGHTLIFE",
  };
  const typeFilter = new Set(
    (preferences.interests || [])
      .map((item) => INTEREST_TYPES[String(item).trim().toLowerCase()])
      .filter(Boolean),
  );

  const existing = new Set();
  for (const stop of trip.stops || []) {
    for (const item of stop.activities || []) {
      existing.add((item.customName || item.activity?.name || "").toLowerCase());
    }
  }

  const usedDates = new Set();
  const recommendations = [];
  const remaining = context.budget.remaining;
  const style = preferences.style || "balanced";
  const limit = style === "packed" ? 8 : 5;

  for (const stop of trip.stops || []) {
    const cityActs = stored.filter((activity) => activity.cityId === stop.city?.id);
    const filtered = cityActs
      .filter((activity) => (typeFilter.size ? typeFilter.has(activity.type) : true))
      .filter((activity) => !existing.has(activity.name.toLowerCase()));

    for (const activity of filtered) {
      const cost = Number(activity.typicalCost) || 0;
      if (remaining > 0 && cost > remaining && preferences.budgetPriority === "high") {
        continue;
      }
      const empty = calendar.days.find(
        (day) =>
          day.date >= stop.startDate &&
          day.date <= stop.endDate &&
          day.activities.length === 0 &&
          !usedDates.has(day.date),
      );
      const light = calendar.days.find(
        (day) =>
          day.date >= stop.startDate &&
          day.date <= stop.endDate &&
          day.conflicts.length === 0 &&
          day.activities.length < 4 &&
          !usedDates.has(day.date),
      );
      const suggestedDate = empty?.date || light?.date || stop.startDate;
      if (!suggestedDate) {
        continue;
      }
      usedDates.add(suggestedDate);
      recommendations.push({
        title: activity.name,
        reason:
          activity.description ||
          `From the GlobeTrotter activity catalog for ${stop.city?.name}. Scheduled on a lighter day so it does not clash with timed activities already on the itinerary.`,
        estimatedCost: cost,
        suggestedDate,
        city: stop.city?.name,
      });
      if (recommendations.length >= limit) {
        break;
      }
    }
    if (recommendations.length >= limit) {
      break;
    }
  }

  if (recommendations.length === 0) {
    const fallback = catalogSuggestions(context, preferences);
    return {
      summary: fallback.summary,
      recommendations: fallback.recommendations,
      mode: "smart_analysis",
      source: "smart_analysis",
    };
  }

  return {
    summary: `Smart analysis found ${recommendations.length} catalog activit${recommendations.length === 1 ? "y" : "ies"} already stored for your destinations.`,
    recommendations,
    mode: "smart_analysis",
    source: "smart_analysis",
  };
}

export async function answerQuestion(tripId, userId, question) {
  const message = String(question || "").trim();
  if (!message) {
    throw new HttpError(400, "Message is required");
  }

  try {
    const result = await askTripAssistant(tripId, userId, message);
    return {
      answer: result.answer,
      relatedSuggestions: result.suggestions || [],
      budgetImpact: result.budgetImpact,
      mode: modeFromSource(result.source),
      source: result.source,
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 502) {
      const context = await getTripContext(tripId, userId);
      const fallback = buildSmartChatResponse(context, message);
      return {
        answer: `${fallback.answer} The language model was unavailable, so this is Smart analysis mode.`,
        relatedSuggestions: fallback.suggestions || [],
        budgetImpact: fallback.budgetImpact,
        mode: "smart_analysis",
        source: "smart_analysis",
      };
    }
    throw err;
  }
}

export function getAssistantStatus() {
  const status = getAiStatus();
  return {
    configured: status.configured,
    mode: status.configured ? "ai" : "smart_analysis",
    provider: status.provider,
    model: status.model,
    message: status.configured
      ? "Optional AI provider is configured. Server-side trip math still comes from PostgreSQL."
      : "Smart Analysis Mode",
  };
}
