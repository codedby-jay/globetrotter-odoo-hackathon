import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getStatus } from "../controllers/aiController.js";

const router = Router();

router.use(authMiddleware);
router.get("/status", getStatus);

export default router;
