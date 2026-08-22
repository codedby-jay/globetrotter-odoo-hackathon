import jwt from "jsonwebtoken";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    getSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, getSecret());
  if (!payload?.sub || !payload?.role) {
    throw new Error("Invalid token payload");
  }
  return {
    id: payload.sub,
    role: payload.role,
  };
}
