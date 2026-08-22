function sendZodError(res, result) {
  const details = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
  }));
  return res.status(400).json({
    error: "Validation failed",
    details,
  });
}

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendZodError(res, result);
    }

    req.body = result.data;
    return next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return sendZodError(res, result);
    }

    req.validatedQuery = result.data;
    return next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return sendZodError(res, result);
    }

    req.params = result.data;
    return next();
  };
}
