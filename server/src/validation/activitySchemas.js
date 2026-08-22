import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

const timeString = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a time in HH:MM format");

const activityType = z.enum([
  "SIGHTSEEING",
  "FOOD",
  "NATURE",
  "CULTURE",
  "ADVENTURE",
  "SHOPPING",
  "NIGHTLIFE",
  "OTHER",
]);

const nonNegativeCost = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === "") {
      return undefined;
    }
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) {
      ctx.addIssue({ code: "custom", message: "Cost must be a number" });
      return z.NEVER;
    }
    if (amount < 0) {
      ctx.addIssue({ code: "custom", message: "Cost cannot be negative" });
      return z.NEVER;
    }
    return amount;
  });

const activityPayloadSchema = z
  .object({
    name: z.string().trim().min(1, "Activity name is required").max(120),
    type: activityType.optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    imageUrl: z
      .union([z.string().trim().url(), z.literal(""), z.null()])
      .optional(),
    durationMin: z.coerce.number().int().min(0).optional().nullable(),
    typicalCost: nonNegativeCost,
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    externalId: z.string().trim().max(180).optional(),
  })
  .strict();

export const activitySearchQuerySchema = z.object({
  cityId: z.string().uuid("Invalid city id"),
  q: z.string().trim().max(80).optional(),
});

export const stopIdParamSchema = z.object({
  stopId: z.string().uuid("Invalid stop id"),
});

export const stopActivityIdParamSchema = z.object({
  id: z.string().uuid("Invalid activity id"),
});

export const createStopActivitySchema = z
  .object({
    activityId: z.string().uuid("Invalid activity id").optional(),
    activity: activityPayloadSchema.optional(),
    customName: z.string().trim().max(120).optional().nullable(),
    customDescription: z.string().trim().max(2000).optional().nullable(),
    scheduledDate: dateString,
    startTime: timeString.optional().nullable(),
    endTime: timeString.optional().nullable(),
    durationMin: z.coerce.number().int().min(0).optional().nullable(),
    cost: nonNegativeCost,
    notes: z.string().trim().max(1000).optional().nullable(),
    position: z.coerce.number().int().min(0, "Position cannot be negative").optional(),
  })
  .strict()
  .refine((data) => Boolean(data.activityId || data.activity?.name || data.customName), {
    message: "Select an activity",
    path: ["activityId"],
  });

export const updateStopActivitySchema = z
  .object({
    activityId: z.string().uuid("Invalid activity id").optional(),
    activity: activityPayloadSchema.optional(),
    customName: z.string().trim().max(120).optional().nullable(),
    customDescription: z.string().trim().max(2000).optional().nullable(),
    scheduledDate: dateString.optional(),
    startTime: timeString.optional().nullable(),
    endTime: timeString.optional().nullable(),
    durationMin: z.coerce.number().int().min(0).optional().nullable(),
    cost: nonNegativeCost,
    notes: z.string().trim().max(1000).optional().nullable(),
    position: z.coerce.number().int().min(0, "Position cannot be negative").optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const reorderStopActivitiesSchema = z
  .object({
    stopActivityIds: z
      .array(z.string().uuid("Invalid activity id"))
      .min(1, "stopActivityIds is required"),
  })
  .strict();
