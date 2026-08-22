import * as authService from "../services/authService.js";

function handleAuthError(err, next) {
  if (err.status) {
    return { status: err.status, error: err.message };
  }
  next(err);
  return null;
}

export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    const mapped = handleAuthError(err, next);
    if (!mapped) return undefined;
    return res.status(mapped.status).json({ error: mapped.error });
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    const mapped = handleAuthError(err, next);
    if (!mapped) return undefined;
    return res.status(mapped.status).json({ error: mapped.error });
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return res.json({ user });
  } catch (err) {
    const mapped = handleAuthError(err, next);
    if (!mapped) return undefined;
    return res.status(mapped.status).json({ error: mapped.error });
  }
}

export async function logout(_req, res) {
  return res.json({
    message: "Logged out. Discard the access token on the client.",
  });
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    return res.json(result);
  } catch (err) {
    const mapped = handleAuthError(err, next);
    if (!mapped) return undefined;
    return res.status(mapped.status).json({ error: mapped.error });
  }
}
