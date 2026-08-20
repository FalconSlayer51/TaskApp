import { Router } from "express";
import { login, me, register, updateMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  registerSchema,
  updateMeSchema,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validate(updateMeSchema), updateMe);

export default router;
