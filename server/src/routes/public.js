import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateParams } from "../middleware/validate.js";
import { copyPublicTrip, getPublicTrip } from "../controllers/shareController.js";
import { publicTripSlugSchema } from "../validation/shareSchemas.js";

const router = Router();

router.get("/trips/:slug", validateParams(publicTripSlugSchema), getPublicTrip);
router.post(
  "/trips/:slug/copy",
  authMiddleware,
  validateParams(publicTripSlugSchema),
  copyPublicTrip,
);

export default router;
