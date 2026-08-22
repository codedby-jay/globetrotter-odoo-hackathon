import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

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

export const tripIdParamsSchema = z.object({
  id: z.string().uuid("Invalid trip id"),
});

export const stopIdParamsSchema = z.object({
  id: z.string().uuid("Invalid stop id"),
});

export const createStopSchema = z
  .object({
    cityId: z.string().uuid("Invalid city id"),
    startDate: dateString,
    endDate: dateString,
    notes: z.string().trim().max(1000).optional().nullable(),
  })
  .strict()
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export const updateStopSchema = z
  .object({
    cityId: z.string().uuid("Invalid city id").optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    notes: z.string().trim().max(1000).optional().nullable(),
    stayCost: nonNegativeCost,
    transportCost: nonNegativeCost,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return data.endDate >= data.startDate;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

export const reorderStopsSchema = z
  .object({
    stopIds: z.array(z.string().uuid("Invalid stop id")).min(1, "stopIds is required"),
  })
  .strict();
