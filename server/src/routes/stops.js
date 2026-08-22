import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createStopActivity,
  listStopActivities,
  reorderStopActivities,
} from "../controllers/activityController.js";
import { deleteStop, updateStop } from "../controllers/stopController.js";
import {
  createStopActivitySchema,
  reorderStopActivitiesSchema,
} from "../validation/activitySchemas.js";
import { stopIdParamsSchema, updateStopSchema } from "../validation/stopSchemas.js";

const router = Router();

router.use(authMiddleware);
router.get("/:id/activities", validateParams(stopIdParamsSchema), listStopActivities);
router.post(
  "/:id/activities",
  validateParams(stopIdParamsSchema),
  validateBody(createStopActivitySchema),
  createStopActivity,
);
router.put(
  "/:id/activities/reorder",
  validateParams(stopIdParamsSchema),
  validateBody(reorderStopActivitiesSchema),
  reorderStopActivities,
);
router.patch(
  "/:id",
  validateParams(stopIdParamsSchema),
  validateBody(updateStopSchema),
  updateStop,
);
router.delete("/:id", validateParams(stopIdParamsSchema), deleteStop);

export default router;
