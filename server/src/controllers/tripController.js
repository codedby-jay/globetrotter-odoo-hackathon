import * as tripService from "../services/tripService.js";

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
