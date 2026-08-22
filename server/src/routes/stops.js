import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { deleteStop, updateStop } from "../controllers/stopController.js";
import { stopIdParamsSchema, updateStopSchema } from "../validation/stopSchemas.js";

const router = Router();

router.use(authMiddleware);
router.patch(
  "/:id",
  validateParams(stopIdParamsSchema),
  validateBody(updateStopSchema),
  updateStop,
);
router.delete("/:id", validateParams(stopIdParamsSchema), deleteStop);

export default router;
