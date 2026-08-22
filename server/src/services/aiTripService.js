import { getBudgetSummary } from "./expenseService.js";
import { getTrip } from "./tripService.js";
import { buildCalendar, activityLabelFromItem } from "../lib/calendar.js";
import { HttpError } from "../lib/httpError.js";
import { generateText, getAiStatus, parseJsonContent } from "../providers/aiProvider.js";
import { buildCatalogTemplates } from "../providers/activityCatalog.js";
import { isAiConfigured } from "../config/ai.js";

const INTEREST_TYPES = {
  culture: "CULTURE",
  food: "FOOD",
  nature: "NATURE",
  sightseeing: "SIGHTSEEING",
  adventure: "ADVENTURE",
  shopping: "SHOPPING",
  nightlife: "NIGHTLIFE",
};

const OVERLOAD_COUNT = 4;
const OVERLOAD_MINUTES = 480;

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function activityName(item) {
  return activityLabelFromItem(item);
}

export async function getTripContext(tripId, userId) {
  const trip = await getTrip(userId, tripId);
  const budget = await getBudgetSummary(userId, tripId);
  const calendar = buildCalendar(trip);

  const destinations = (trip.stops || []).map((stop) => ({
    city: stop.city?.name || "Unknown city",
    country: stop.city?.country || null,
    startDate: stop.startDate,
    endDate: stop.endDate,
    notes: stop.notes || null,
    activityCount: (stop.activities || []).length,
    activities: (stop.activities || []).map((item) => ({
      name: activityName(item),
      scheduledDate: item.scheduledDate,
      startTime: item.startTime,
      endTime: item.endTime,
      durationMin: item.durationMin,
      cost: item.cost ?? 0,
      type: item.activity?.type || null,
    })),
  }));

  const expenses = (trip.expenses || []).map((expense) => ({
    description: expense.description || expense.label,
    category: expense.category,
    amount: expense.amount,
    expenseDate: expense.expenseDate || expense.incurredOn,
  }));

  const days = calendar.days.map((day) => ({
    date: day.date,
    destinationNames: [...new Set(day.stops.map((stop) => stop.city?.name).filter(Boolean))],
    activityCount: day.activities.length,
    activityNames: day.activities.map(activityName),
    conflictCount: day.conflicts.length,
  }));

  return {
    trip: {
      name: trip.name,
      description: trip.description || "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      currency: trip.currency,
    },
    budget: {
      budgetLimit: budget.budgetLimit,
      totalSpent: budget.totalSpent,
      remaining: budget.remaining,
      percentageUsed: budget.percentageUsed,
      overBudget: budget.overBudget,
      currency: budget.currency,
      categories: budget.categories,
    },
    destinations,
    expenses,
    calendar: {
      emptyDays: days.filter((day) => day.activityCount === 0).map((day) => day.date),
      overloadedDays: days
        .filter((day) => day.activityCount >= OVERLOAD_COUNT)
        .map((day) => day.date),
      days,
      unscheduledCount: calendar.unscheduled.length,
    },
    raw: { trip, budget, calendar },
  };
}

export function buildTripPrompt(context) {
  const { raw, ...safe } = context;
  return JSON.stringify(safe);
}

function existingActivityKeys(trip) {
  const keys = new Set();
  for (const stop of trip.stops || []) {
    for (const item of stop.activities || []) {
      keys.add(`${stop.city?.name || ""}:${activityName(item).toLowerCase()}`);
    }
  }
  return keys;
}

function busyDates(calendar) {
  return new Set(
    calendar.days
      .filter((day) => day.activities.length >= OVERLOAD_COUNT || day.conflicts.length > 0)
      .map((day) => day.date),
  );
}

function pickSuggestedDate(stop, calendar, usedDates) {
  const empty = calendar.days.filter(
    (day) =>
      day.date >= stop.startDate &&
      day.date <= stop.endDate &&
      day.activities.length === 0 &&
      !usedDates.has(day.date),
  );
  if (empty[0]) {
    return empty[0].date;
  }
  const light = calendar.days.filter(
    (day) =>
      day.date >= stop.startDate &&
      day.date <= stop.endDate &&
      day.activities.length < OVERLOAD_COUNT &&
      day.conflicts.length === 0 &&
      !busyDates(calendar).has(day.date),
  );
  return light[0]?.date || stop.startDate;
}

function interestTypes(interests = []) {
  const types = new Set();
  for (const interest of interests) {
    const mapped = INTEREST_TYPES[String(interest).trim().toLowerCase()];
    if (mapped) {
      types.add(mapped);
    }
  }
  return types;
}

export function analyzeTripContext(context) {
  const { raw, budget, trip } = context;
  const { trip: tripData, calendar } = raw;
  const issues = [];
  const suggestions = [];
  const currency = budget.currency;

  for (const day of calendar.days) {
    if (day.activities.length === 0) {
      issues.push({
        type: "EMPTY_DAY",
        severity: "medium",
        message: `${day.date} has no planned activities.`,
      });
    }
    const duration = day.activities.reduce((sum, item) => sum + (item.durationMin || 0), 0);
    if (day.activities.length >= OVERLOAD_COUNT || duration >= OVERLOAD_MINUTES) {
      issues.push({
        type: "OVERLOADED_DAY",
        severity: "high",
        message: `${day.date} looks busy (${day.activities.length} activities).`,
      });
    }
    for (const conflict of day.conflicts) {
      issues.push({
        type: "SCHEDULE_CONFLICT",
        severity: "high",
        message: `${day.date}: ${conflict.message}`,
      });
    }
  }

  for (const stop of tripData.stops || []) {
    if (!(stop.activities || []).length) {
      issues.push({
        type: "DESTINATION_WITHOUT_ACTIVITIES",
        severity: "medium",
        message: `${stop.city?.name || "A destination"} has no activities yet.`,
      });
    }
  }

  for (const item of calendar.unscheduled) {
    issues.push({
      type: "ACTIVITY_WITHOUT_DATE",
      severity: "medium",
      message: `${activityName(item.activity)} is not scheduled on a trip day.`,
    });
  }

  if (budget.overBudget) {
    issues.push({
      type: "OVER_BUDGET",
      severity: "high",
      message: `Expenses exceed the ${currency} ${budget.budgetLimit} budget by ${currency} ${Math.abs(budget.remaining)}.`,
    });
  } else if (budget.budgetLimit > 0 && budget.percentageUsed >= 80) {
    issues.push({
      type: "BUDGET_TIGHT",
      severity: "medium",
      message: `${budget.percentageUsed}% of the trip budget is already spent.`,
    });
  }

  const amounts = (tripData.expenses || []).map((expense) => Number(expense.amount) || 0);
  const avg =
    amounts.length > 0 ? amounts.reduce((sum, value) => sum + value, 0) / amounts.length : 0;
  const highThreshold =
    budget.budgetLimit > 0 ? budget.budgetLimit * 0.3 : Math.max(avg * 2, 0);
  for (const expense of tripData.expenses || []) {
    const amount = Number(expense.amount) || 0;
    if (highThreshold > 0 && amount >= highThreshold && amount > 0) {
      issues.push({
        type: "HIGH_EXPENSE",
        severity: "low",
        message: `${expense.description || expense.label} (${currency} ${amount}) is unusually high versus this trip's budget.`,
      });
    }
  }

  if (calendar.days.some((day) => day.activityCount === 0)) {
    suggestions.push("Fill empty days from the activity catalog for that city.");
  }
  if (budget.remaining > 0) {
    suggestions.push(
      `About ${currency} ${budget.remaining} remains. Prefer free or low-cost catalog activities if you want to stay inside the budget.`,
    );
  }
  if (!tripData.stops?.length) {
    suggestions.push("Add at least one destination before asking for a detailed itinerary.");
  }

  let overall = `${trip.name} runs ${trip.startDate} to ${trip.endDate}.`;
  if (issues.length === 0) {
    overall += " The itinerary and budget look healthy.";
  } else {
    overall += ` Smart analysis found ${issues.length} item${issues.length === 1 ? "" : "s"} to review.`;
  }

  return {
    overall,
    issues,
    suggestions,
    source: "smart_analysis",
  };
}

export function catalogSuggestions(context, preferences = {}) {
  const { raw, budget } = context;
  const { trip, calendar } = raw;
  const types = interestTypes(preferences.interests);
  const style = preferences.style || "balanced";
  const existing = existingActivityKeys(trip);
  const usedDates = new Set();
  const recommendations = [];
  const remaining = budget.remaining;

  for (const stop of trip.stops || []) {
    if (!stop.city) {
      continue;
    }
    const templates = buildCatalogTemplates(stop.city)
      .filter((template) => (types.size ? types.has(template.type) : true))
      .sort((a, b) => b.popularity - a.popularity);

    for (const template of templates) {
      const key = `${stop.city.name}:${template.name.toLowerCase()}`;
      if (existing.has(key)) {
        continue;
      }
      const cost = Number(template.typicalCost) || 0;
      if (remaining > 0 && cost > remaining && preferences.budgetPriority === "high") {
        continue;
      }
      const suggestedDate = pickSuggestedDate(stop, calendar, usedDates);
      if (!suggestedDate) {
        continue;
      }
      usedDates.add(suggestedDate);
      recommendations.push({
        title: template.name,
        reason: `${template.description} Suggested for ${stop.city.name} on a lighter day so it does not clash with the current schedule.`,
        estimatedCost: cost,
        suggestedDate,
        city: stop.city.name,
      });
      if (recommendations.length >= (style === "packed" ? 8 : 5)) {
        break;
      }
    }
    if (recommendations.length >= 5) {
      break;
    }
  }

  const summary =
    recommendations.length > 0
      ? `Smart analysis suggests ${recommendations.length} catalog idea${recommendations.length === 1 ? "" : "s"} that fit remaining days and the current budget.`
      : "Smart analysis has no extra catalog ideas that fit the current itinerary and budget.";

  return { summary, recommendations, source: "smart_analysis" };
}

export function buildSmartChatResponse(context, message) {
  const analysis = analyzeTripContext(context);
  const { budget, trip, calendar, destinations } = context;
  const text = String(message || "").toLowerCase();
  const parts = [];

  parts.push(
    `${trip.name} is ${trip.startDate} to ${trip.endDate} with a ${budget.currency} ${budget.budgetLimit} budget. Spent ${budget.currency} ${budget.totalSpent}; remaining ${budget.currency} ${budget.remaining} (${budget.percentageUsed}% used).`,
  );

  if (text.includes("budget") || text.includes("afford") || text.includes("remaining") || /₹|rs\b/.test(text)) {
    if (budget.overBudget) {
      parts.push("You are already over budget, so new paid activities would increase the overspend unless you cut expenses first.");
    } else if (budget.remaining <= 0 && budget.budgetLimit === 0) {
      parts.push("No budget limit is set on this trip, so remaining funds cannot be calculated from the database.");
    } else {
      parts.push(`You can afford another activity if its cost stays at or under ${budget.currency} ${budget.remaining} based on recorded expenses only.`);
    }
  }

  if (text.includes("empty") || text.includes("gap") || text.includes("first day")) {
    if (calendar.emptyDays.length) {
      parts.push(`Empty itinerary days: ${calendar.emptyDays.join(", ")}.`);
    } else {
      parts.push("There are no fully empty days in the current itinerary.");
    }
  }

  if (text.includes("busy") || text.includes("overload") || text.includes("conflict")) {
    const conflictIssues = analysis.issues.filter((issue) => issue.type === "SCHEDULE_CONFLICT");
    if (conflictIssues.length) {
      parts.push(conflictIssues.map((issue) => issue.message).join(" "));
    } else if (calendar.overloadedDays.length) {
      parts.push(`Busier days: ${calendar.overloadedDays.join(", ")}.`);
    } else {
      parts.push("No overlapping timed activities were detected.");
    }
  }

  const cityHit = destinations.find((stop) => text.includes(stop.city.toLowerCase()));
  if (cityHit) {
    parts.push(
      `${cityHit.city} is ${cityHit.startDate} to ${cityHit.endDate} with ${cityHit.activityCount} planned activit${cityHit.activityCount === 1 ? "y" : "ies"}.`,
    );
  }

  if (destinations.length === 0) {
    parts.push("No destinations are stored yet, so city-specific ideas are unavailable.");
  }

  parts.push("These figures come from GlobeTrotter records (TripExpense for money). Stay/activity itinerary costs are not auto-counted in the budget.");

  const suggestions = catalogSuggestions(context, { style: "balanced", interests: ["culture", "food", "nature"] });
  const estimatedCost = roundMoney(
    suggestions.recommendations.slice(0, 2).reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
  );

  return {
    answer: parts.join(" "),
    suggestions: suggestions.recommendations.slice(0, 3),
    budgetImpact: {
      estimatedCost,
      remainingBudget: roundMoney(budget.remaining - estimatedCost),
    },
    source: "smart_analysis",
  };
}

const SYSTEM_PROMPT = `You are GlobeTrotter's trip assistant.
Use ONLY the JSON trip context provided by the server. Do not invent cities, dates, costs, or expenses that are not in that JSON.
Money figures (budgetLimit, totalSpent, remaining, percentageUsed) are already calculated — do not recalculate them from scratch; quote those numbers.
Itinerary stay/transport/activity costs are NOT included in totalSpent unless they also appear under expenses.
If something is missing from the context, say it is unavailable.
You must not modify trips, expenses, or user data. Recommendations only.
Never mention API keys, database credentials, other users, or internal ids.
Reply with a JSON object only.`;

function sanitizeRecommendations(items, context) {
  const allowedDates = new Set(context.raw.calendar.days.map((day) => day.date));
  const busy = busyDates(context.raw.calendar);
  const list = Array.isArray(items) ? items : [];
  return list
    .map((item) => {
      const title = String(item?.title || "").trim().slice(0, 120);
      if (!title) {
        return null;
      }
      let suggestedDate = item?.suggestedDate && allowedDates.has(item.suggestedDate) ? item.suggestedDate : null;
      if (suggestedDate && busy.has(suggestedDate)) {
        suggestedDate = context.calendar.emptyDays.find((date) => date !== suggestedDate) || suggestedDate;
      }
      const estimatedCost = Number(item?.estimatedCost);
      return {
        title,
        reason: String(item?.reason || "").trim().slice(0, 400),
        estimatedCost: Number.isFinite(estimatedCost) ? roundMoney(Math.max(0, estimatedCost)) : 0,
        suggestedDate,
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function withBudgetImpact(estimatedCost, remaining) {
  const cost = roundMoney(Number(estimatedCost) || 0);
  return {
    estimatedCost: cost,
    remainingBudget: roundMoney(remaining - cost),
  };
}

async function askModel(system, prompt) {
  const text = await generateText(prompt, { system, json: true, temperature: 0.3 });
  return parseJsonContent(text);
}

export async function askTripAssistant(tripId, userId, question) {
  const message = String(question || "").trim();
  if (!message) {
    throw new HttpError(400, "Message is required");
  }
  const context = await getTripContext(tripId, userId);
  const fallback = buildSmartChatResponse(context, message);

  if (!isAiConfigured()) {
    return fallback;
  }

  try {
    const parsed = await askModel(
      SYSTEM_PROMPT,
      `Trip context (authoritative):\n${buildTripPrompt(context)}\n\nTraveler question:\n${message}\n\nReturn JSON: {"answer": string, "suggestions": [{"title": string, "reason": string, "estimatedCost": number, "suggestedDate": "YYYY-MM-DD"|null}], "budgetImpact": {"estimatedCost": number}}`,
    );
    const suggestions = sanitizeRecommendations(parsed.suggestions, context);
    const estimated =
      Number(parsed?.budgetImpact?.estimatedCost) ||
      suggestions.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    return {
      answer: String(parsed.answer || fallback.answer).trim(),
      suggestions,
      budgetImpact: withBudgetImpact(estimated, context.budget.remaining),
      source: "ai",
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 400 && err.code === "AI_NOT_CONFIGURED") {
      return fallback;
    }
    if (err instanceof HttpError && err.status === 502) {
      throw err;
    }
    throw err;
  }
}

export async function generateTripSuggestions(tripId, userId, preferences = {}) {
  const context = await getTripContext(tripId, userId);
  const fallback = catalogSuggestions(context, preferences);

  if (!isAiConfigured()) {
    return fallback;
  }

  try {
    const parsed = await askModel(
      SYSTEM_PROMPT,
      `Trip context (authoritative):\n${buildTripPrompt(context)}\n\nPreferences:\n${JSON.stringify(preferences)}\n\nSuggest activities that fit remaining budget ${context.budget.remaining} ${context.budget.currency}, avoid dates that already look overloaded or have conflicts, and do not duplicate named activities already on the itinerary.\nReturn JSON: {"summary": string, "recommendations": [{"title": string, "reason": string, "estimatedCost": number, "suggestedDate": "YYYY-MM-DD"}]}`,
    );
    const recommendations = sanitizeRecommendations(parsed.recommendations, context);
    return {
      summary: String(parsed.summary || fallback.summary).trim(),
      recommendations: recommendations.length ? recommendations : fallback.recommendations,
      source: "ai",
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 502) {
      throw err;
    }
    return fallback;
  }
}

export async function analyzeTrip(tripId, userId) {
  const context = await getTripContext(tripId, userId);
  const fallback = analyzeTripContext(context);

  if (!isAiConfigured()) {
    return fallback;
  }

  try {
    const parsed = await askModel(
      SYSTEM_PROMPT,
      `Trip context (authoritative):\n${buildTripPrompt(context)}\n\nWrite a short overall assessment. You may rephrase the issues already implied by emptyDays, overloadedDays, and expenses, but do not invent new dates or amounts.\nReturn JSON: {"overall": string, "issues": [{"type": string, "severity": "low"|"medium"|"high", "message": string}], "suggestions": [string]}`,
    );
    const issues = Array.isArray(parsed.issues) && parsed.issues.length ? parsed.issues : fallback.issues;
    const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length
      ? parsed.suggestions.map((item) => String(item)).slice(0, 8)
      : fallback.suggestions;
    return {
      overall: String(parsed.overall || fallback.overall).trim(),
      issues: issues
        .map((issue) => ({
          type: String(issue.type || "NOTE").slice(0, 40),
          severity: ["low", "medium", "high"].includes(issue.severity) ? issue.severity : "medium",
          message: String(issue.message || "").slice(0, 300),
        }))
        .filter((issue) => issue.message)
        .slice(0, 20),
      suggestions,
      source: "ai",
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 502) {
      return { ...fallback, providerUnavailable: true };
    }
    return fallback;
  }
}

export { getAiStatus };
