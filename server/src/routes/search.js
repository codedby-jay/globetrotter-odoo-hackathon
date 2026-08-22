import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateQuery } from "../middleware/validate.js";
import { searchCitiesHandler } from "../controllers/searchController.js";
import { citySearchQuerySchema } from "../validation/searchSchemas.js";

const router = Router();

router.use(authMiddleware);
router.get("/cities", validateQuery(citySearchQuerySchema), searchCitiesHandler);

export default router;
