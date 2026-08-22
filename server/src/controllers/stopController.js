import * as stopService from "../services/stopService.js";

export async function createStop(req, res, next) {
  try {
    const stop = await stopService.createStop(req.user.id, req.params.id, req.body);
    return res.status(201).json({ stop });
  } catch (err) {
    return next(err);
  }
}

export async function updateStop(req, res, next) {
  try {
    const stop = await stopService.updateStop(req.user.id, req.params.id, req.body);
    return res.json({ stop });
  } catch (err) {
    return next(err);
  }
}

export async function deleteStop(req, res, next) {
  try {
    const result = await stopService.deleteStop(req.user.id, req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function reorderStops(req, res, next) {
  try {
    const stops = await stopService.reorderStops(
      req.user.id,
      req.params.id,
      req.body.stopIds,
    );
    return res.json({ stops });
  } catch (err) {
    return next(err);
  }
}
