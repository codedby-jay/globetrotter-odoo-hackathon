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
  updateTrip,
} from "../controllers/tripController.js";
import { createStop, reorderStops } from "../controllers/stopController.js";
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
router.get("/:id", validateParams(tripIdParamsSchema), getTrip);
router.patch(
  "/:id",
  validateParams(tripIdParamsSchema),
  validateBody(updateTripSchema),
  updateTrip,
);
router.delete("/:id", validateParams(tripIdParamsSchema), deleteTrip);

export default router;
