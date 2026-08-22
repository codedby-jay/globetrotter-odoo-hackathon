import { z } from "zod";

export const aiTripParamsSchema = z.object({
  id: z.string().uuid("Invalid trip id"),
});

export const chatBodySchema = z
  .object({
    message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
  })
  .strict();

export const suggestionsBodySchema = z.preprocess(
  (value) => value ?? {},
  z
    .object({
      preferences: z
        .object({
          style: z.enum(["relaxed", "balanced", "packed"]).optional(),
          interests: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
          budgetPriority: z.enum(["low", "medium", "high"]).optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
);
