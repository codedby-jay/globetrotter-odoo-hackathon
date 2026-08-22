import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  createTrip,
  deleteTrip,
  getTrip,
  listTrips,
  recordOwnerShare,
  updateTrip,
  updateVisibility,
} from "../controllers/tripController.js";
import { createStop, reorderStops } from "../controllers/stopController.js";
import {
  createExpense,
  getBudgetSummary,
  listExpenses,
} from "../controllers/expenseController.js";
import {
  createTripSchema,
  listTripsQuerySchema,
  tripIdParamsSchema,
  updateTripSchema,
} from "../validation/tripSchemas.js";
import {
  createStopSchema,
  reorderStopsSchema,
} from "../validation/stopSchemas.js";
import { createExpenseSchema } from "../validation/expenseSchemas.js";
import { shareEventSchema, visibilitySchema } from "../validation/shareSchemas.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listTripsQuerySchema), listTrips);
router.post("/", validateBody(createTripSchema), createTrip);
router.post(
  "/:id/stops",
  validateParams(tripIdParamsSchema),
  validateBody(createStopSchema),
  createStop,
);
router.put(
  "/:id/stops/reorder",
  validateParams(tripIdParamsSchema),
  validateBody(reorderStopsSchema),
  reorderStops,
);
router.get("/:id/expenses", validateParams(tripIdParamsSchema), listExpenses);
router.post(
  "/:id/expenses",
  validateParams(tripIdParamsSchema),
  validateBody(createExpenseSchema),
  createExpense,
);
router.get("/:id/budget", validateParams(tripIdParamsSchema), getBudgetSummary);
router.patch(
  "/:id/visibility",
  validateParams(tripIdParamsSchema),
  validateBody(visibilitySchema),
  updateVisibility,
);
router.post(
  "/:id/share-events",
  validateParams(tripIdParamsSchema),
  validateBody(shareEventSchema),
  recordOwnerShare,
);
router.get("/:id", validateParams(tripIdParamsSchema), getTrip);
router.patch(
  "/:id",
  validateParams(tripIdParamsSchema),
  validateBody(updateTripSchema),
  updateTrip,
);
router.delete("/:id", validateParams(tripIdParamsSchema), deleteTrip);

export default router;
