import * as tripService from "../services/tripService.js";
import { recordShareEvent } from "../services/shareService.js";

export async function listTrips(req, res, next) {
  try {
    const trips = await tripService.listTrips(req.user.id, req.validatedQuery?.status ?? req.query.status);
    return res.json({ trips });
  } catch (err) {
    return next(err);
  }
}

export async function createTrip(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.user.id, req.body);
    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await tripService.getTrip(req.user.id, req.params.id);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = await tripService.updateTrip(req.user.id, req.params.id, req.body);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const result = await tripService.deleteTrip(req.user.id, req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function updateVisibility(req, res, next) {
  try {
    const trip = await tripService.updateVisibility(
      req.user.id,
      req.params.id,
      req.body.visibility,
    );
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
}

export async function recordOwnerShare(req, res, next) {
  try {
    await tripService.requireOwnedTrip(req.params.id, req.user.id);
    await recordShareEvent(req.params.id, req.body.event);
    return res.json({ message: "Share event recorded" });
  } catch (err) {
    return next(err);
  }
}
