import * as shareService from "../services/shareService.js";

export async function getPublicTrip(req, res, next) {
  try {
    const trip = await shareService.getPublicTrip(req.params.slug);
    return res.json({ trip });
  } catch (err) {
    return next(err);
  }
}

export async function copyPublicTrip(req, res, next) {
  try {
    const trip = await shareService.copyPublicTrip(req.user.id, req.params.slug);
    return res.status(201).json({ trip });
  } catch (err) {
    return next(err);
  }
}
