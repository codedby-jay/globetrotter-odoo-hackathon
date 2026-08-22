import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/jwt.js";
import { SAFE_USER_SELECT, toPublicUser } from "../lib/publicUser.js";

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_HOURS = 1;
const INVALID_CREDENTIALS = "Invalid email or password";
const RESET_NOTICE =
  "If that email is registered, you can use the reset link from the server log.";

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function createResetToken() {
  return randomBytes(32).toString("base64url");
}

export async function signup({ name, email, password }) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    const error = new Error("An account with this email already exists");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: SAFE_USER_SELECT,
  });

  return {
    user: toPublicUser(user),
    token: signAccessToken(user),
  };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error(INVALID_CREDENTIALS);
    error.status = 401;
    throw error;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    const error = new Error(INVALID_CREDENTIALS);
    error.status = 401;
    throw error;
  }

  return {
    user: toPublicUser(user),
    token: signAccessToken(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }

  return toPublicUser(user);
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    const rawToken = createResetToken();
    const expires = new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashResetToken(rawToken),
        passwordResetExpires: expires,
      },
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    console.log(`Password reset URL (dev): ${resetUrl}`);
  }

  return { message: RESET_NOTICE };
}

export async function resetPassword({ token, password }) {
  const hashedToken = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: "Password updated. You can log in with your new password." };
}
