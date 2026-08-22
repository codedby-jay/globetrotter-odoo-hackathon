import { z } from "zod";

export const odooTripParamsSchema = z.object({
  id: z.string().uuid("Invalid trip id"),
});
