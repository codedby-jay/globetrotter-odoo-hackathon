import { randomBytes } from "node:crypto";

/** URL-safe public slug. Never use the trip id in the public URL. */
export function createShareSlug() {
  return randomBytes(9).toString("base64url");
}
