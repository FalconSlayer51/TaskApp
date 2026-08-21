import { Router } from "express";
import {
  inviteMember,
  listDirectory,
  listMembers,
  listWorkspaces,
  removeMember,
} from "../controllers/workspaceController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  inviteSchema,
  memberParamsSchema,
  workspaceIdParamsSchema,
} from "../validators/workspaceValidators.js";

const router = Router();

router.use(requireAuth);

router.get("/", listWorkspaces);
router.get("/:id/members", validate(workspaceIdParamsSchema, "params"), listMembers);
router.get("/:id/directory", validate(workspaceIdParamsSchema, "params"), listDirectory);
router.post(
  "/:id/invites",
  validate(workspaceIdParamsSchema, "params"),
  validate(inviteSchema),
  inviteMember,
);
router.delete(
  "/:id/members/:userId",
  validate(memberParamsSchema, "params"),
  removeMember,
);

export default router;
