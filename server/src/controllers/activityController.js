import * as activityService from "../services/activityService.js";

export async function searchActivitiesHandler(req, res, next) {
  try {
    const results = await activityService.searchActivities(req.validatedQuery);
    return res.json({ results });
  } catch (err) {
    return next(err);
  }
}

export async function listStopActivities(req, res, next) {
  try {
    const activities = await activityService.listStopActivities(
      req.user.id,
      req.params.stopId || req.params.id,
    );
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
}

export async function createStopActivity(req, res, next) {
  try {
    const activity = await activityService.createStopActivity(
      req.user.id,
      req.params.stopId || req.params.id,
      req.body,
    );
    return res.status(201).json({ activity });
  } catch (err) {
    return next(err);
  }
}

export async function updateStopActivity(req, res, next) {
  try {
    const activity = await activityService.updateStopActivity(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res.json({ activity });
  } catch (err) {
    return next(err);
  }
}

export async function deleteStopActivity(req, res, next) {
  try {
    const result = await activityService.deleteStopActivity(req.user.id, req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function reorderStopActivities(req, res, next) {
  try {
    const activities = await activityService.reorderStopActivities(
      req.user.id,
      req.params.stopId || req.params.id,
      req.body.stopActivityIds,
    );
    return res.json({ activities });
  } catch (err) {
    return next(err);
  }
}
