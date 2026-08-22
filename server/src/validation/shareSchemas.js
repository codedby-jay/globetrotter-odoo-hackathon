import { z } from "zod";

export const publicTripSlugSchema = z.object({
  slug: z.string().trim().min(1, "Share link is required").max(80, "Share link is invalid"),
});

export const visibilitySchema = z
  .object({
    visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]),
  })
  .strict();

export const shareEventSchema = z
  .object({
    event: z.enum(["SHARE"]),
  })
  .strict();
