import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireWorkspaceMember } from "../middleware/workspaceMiddleware.js";

const router = Router();

router.get("/", requireAuth, requireWorkspaceMember, getAnalytics);

export default router;
