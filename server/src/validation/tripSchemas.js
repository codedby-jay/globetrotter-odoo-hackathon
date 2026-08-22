import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

const currencyCode = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{3}$/.test(value), {
    message: "Currency must be a 3-letter code such as USD",
  });

const budgetLimit = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) {
      ctx.addIssue({ code: "custom", message: "Budget must be a number" });
      return z.NEVER;
    }
    if (amount < 0) {
      ctx.addIssue({ code: "custom", message: "Budget cannot be negative" });
      return z.NEVER;
    }
    return amount;
  });

const coverPhotoUrl = z
  .union([z.string().trim().url("Enter a valid image URL"), z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }
    return value;
  });

function withDateOrder(schema) {
  return schema.refine(
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
}

export const createTripSchema = withDateOrder(
  z
    .object({
      name: z.string().trim().min(1, "Trip name is required").max(120, "Trip name is too long"),
      description: z.string().trim().max(2000, "Description is too long").optional().nullable(),
      startDate: dateString,
      endDate: dateString,
      coverPhotoUrl,
      budgetLimit,
      currency: currencyCode.optional().default("USD"),
    })
    .strict(),
);

export const updateTripSchema = withDateOrder(
  z
    .object({
      name: z.string().trim().min(1, "Trip name is required").max(120).optional(),
      description: z.string().trim().max(2000).optional().nullable(),
      startDate: dateString.optional(),
      endDate: dateString.optional(),
      coverPhotoUrl,
      budgetLimit,
      currency: currencyCode.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one field to update",
    }),
);

export const listTripsQuerySchema = z.object({
  status: z.enum(["upcoming", "past"]).optional(),
});

export const tripIdParamsSchema = z.object({
  id: z.string().uuid("Invalid trip id"),
});
