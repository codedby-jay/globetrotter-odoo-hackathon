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
import {
  createTripSchema,
  listTripsQuerySchema,
  tripIdParamsSchema,
  updateTripSchema,
} from "../validation/tripSchemas.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listTripsQuerySchema), listTrips);
router.post("/", validateBody(createTripSchema), createTrip);
router.get("/:id", validateParams(tripIdParamsSchema), getTrip);
router.patch(
  "/:id",
  validateParams(tripIdParamsSchema),
  validateBody(updateTripSchema),
  updateTrip,
);
router.delete("/:id", validateParams(tripIdParamsSchema), deleteTrip);

export default router;
