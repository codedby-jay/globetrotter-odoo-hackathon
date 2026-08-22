import * as aiTripService from "../services/aiTripService.js";
import { getAiStatus } from "../providers/aiProvider.js";

export async function getStatus(_req, res, next) {
  try {
    return res.json(getAiStatus());
  } catch (err) {
    return next(err);
  }
}

export async function chat(req, res, next) {
  try {
    const result = await aiTripService.askTripAssistant(
      req.params.id,
      req.user.id,
      req.body.message,
    );
    return res.json({
      answer: result.answer,
      suggestions: result.suggestions,
      budgetImpact: result.budgetImpact,
      source: result.source,
    });
  } catch (err) {
    return next(err);
  }
}

export async function suggestions(req, res, next) {
  try {
    const result = await aiTripService.generateTripSuggestions(
      req.params.id,
      req.user.id,
      req.body.preferences || {},
    );
    return res.json({
      summary: result.summary,
      recommendations: result.recommendations,
      source: result.source,
    });
  } catch (err) {
    return next(err);
  }
}

export async function analyze(req, res, next) {
  try {
    const result = await aiTripService.analyzeTrip(req.params.id, req.user.id);
    return res.json({
      overall: result.overall,
      issues: result.issues,
      suggestions: result.suggestions,
      source: result.source,
    });
  } catch (err) {
    return next(err);
  }
}
