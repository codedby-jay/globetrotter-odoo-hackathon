import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPassword,
  login,
  logout,
  me,
  resetPassword,
  signup,
} from "../controllers/authController.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "../validation/authSchemas.js";

const router = Router();

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default router;
