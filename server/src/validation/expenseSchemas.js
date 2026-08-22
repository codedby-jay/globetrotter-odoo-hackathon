import { z } from "zod";

const categorySchema = z.enum([
  "TRANSPORT",
  "STAY",
  "ACTIVITY",
  "MEALS",
  "OTHER",
]);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Enter a valid date");

const currencyCode = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z]{3}$/.test(value), {
    message: "Currency must be a 3-letter code such as USD",
  });

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) {
      ctx.addIssue({ code: "custom", message: "Amount must be a finite number" });
      return z.NEVER;
    }
    if (amount < 0) {
      ctx.addIssue({ code: "custom", message: "Amount cannot be negative" });
      return z.NEVER;
    }
    return amount;
  });

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(200, "Description is too long");

export const tripIdParamSchema = z.object({
  id: z.string().uuid("Invalid trip id"),
});

export const expenseIdParamSchema = z.object({
  expenseId: z.string().uuid("Invalid expense id"),
});

export const createExpenseSchema = z
  .object({
    category: categorySchema,
    description: descriptionSchema.optional(),
    label: descriptionSchema.optional(),
    amount: amountSchema,
    currency: currencyCode.optional(),
    expenseDate: dateString.optional(),
    incurredOn: dateString.optional(),
  })
  .strict()
  .refine((data) => Boolean(data.description || data.label), {
    message: "Description is required",
    path: ["description"],
  })
  .refine((data) => Boolean(data.expenseDate || data.incurredOn), {
    message: "Expense date is required",
    path: ["expenseDate"],
  });

export const updateExpenseSchema = z
  .object({
    category: categorySchema.optional(),
    description: descriptionSchema.optional(),
    label: descriptionSchema.optional(),
    amount: amountSchema.optional(),
    currency: currencyCode.optional(),
    expenseDate: dateString.optional().nullable(),
    incurredOn: dateString.optional().nullable(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
