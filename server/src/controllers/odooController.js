import * as odooService from "../services/odooService.js";

export async function getStatus(req, res, next) {
  try {
    const status = await odooService.getOdooStatus();
    return res.json(status);
  } catch (err) {
    return next(err);
  }
}

export async function testTrip(req, res, next) {
  try {
    const result = await odooService.testTripExport(req.params.id, req.user.id);
    return res.json({
      configured: result.configured,
      connected: result.connected,
      message: result.message,
    });
  } catch (err) {
    return next(err);
  }
}

export async function exportTrip(req, res, next) {
  try {
    const result = await odooService.exportTrip(req.params.id, req.user.id);
    return res.json({
      success: result.success,
      message: result.message,
      odoo: result.odoo,
    });
  } catch (err) {
    return next(err);
  }
}
