import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateQuery } from "../middleware/validate.js";
import {
  searchActivitiesHandler,
  searchCitiesHandler,
} from "../controllers/searchController.js";
import { activitySearchQuerySchema } from "../validation/activitySchemas.js";
import { citySearchQuerySchema } from "../validation/searchSchemas.js";

const router = Router();

router.use(authMiddleware);
router.get("/cities", validateQuery(citySearchQuerySchema), searchCitiesHandler);
router.get(
  "/activities",
  validateQuery(activitySearchQuerySchema),
  searchActivitiesHandler,
);

export default router;
