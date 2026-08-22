import * as tripAssistantService from "../services/tripAssistantService.js";

export async function getStatus(_req, res, next) {
  try {
    return res.json(tripAssistantService.getAssistantStatus());
  } catch (err) {
    return next(err);
  }
}

export async function analyze(req, res, next) {
  try {
    const result = await tripAssistantService.analyzeTrip(req.params.id, req.user.id);
    return res.json({
      summary: result.summary,
      budget: result.budget,
      health: result.health,
      issues: result.issues,
      suggestions: result.suggestions,
      recommendations: result.recommendations,
      mode: result.mode,
    });
  } catch (err) {
    return next(err);
  }
}

export async function suggestions(req, res, next) {
  try {
    const result = await tripAssistantService.generateSuggestions(
      req.params.id,
      req.user.id,
      req.body.preferences || {},
    );
    return res.json({
      summary: result.summary,
      recommendations: result.recommendations,
      mode: result.mode,
    });
  } catch (err) {
    return next(err);
  }
}

export async function chat(req, res, next) {
  try {
    const result = await tripAssistantService.answerQuestion(
      req.params.id,
      req.user.id,
      req.body.message,
    );
    return res.json({
      answer: result.answer,
      relatedSuggestions: result.relatedSuggestions,
      budgetImpact: result.budgetImpact,
      mode: result.mode,
    });
  } catch (err) {
    return next(err);
  }
}
