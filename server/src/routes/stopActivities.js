import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  deleteStopActivity,
  updateStopActivity,
} from "../controllers/activityController.js";
import {
  stopActivityIdParamSchema,
  updateStopActivitySchema,
} from "../validation/activitySchemas.js";

const router = Router();

router.use(authMiddleware);
router.patch(
  "/:id",
  validateParams(stopActivityIdParamSchema),
  validateBody(updateStopActivitySchema),
  updateStopActivity,
);
router.delete("/:id", validateParams(stopActivityIdParamSchema), deleteStopActivity);

export default router;
