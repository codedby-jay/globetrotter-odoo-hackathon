import { z } from "zod";

export const citySearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters").max(80, "Search query is too long"),
  country: z.string().trim().max(80).optional(),
  region: z.string().trim().max(80).optional(),
  minCostIndex: z.coerce.number().optional(),
  maxCostIndex: z.coerce.number().optional(),
  sort: z.enum(["name", "popularity", "cost"]).optional(),
});
