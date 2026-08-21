import type { Request, Response } from "express";
import type { z } from "zod";
import { Membership } from "../models/Membership.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toPublicWorkspace } from "../utils/mappers.js";
import { ensurePersonalWorkspace } from "../utils/workspaces.js";
import type { inviteSchema } from "../validators/workspaceValidators.js";
import type { PublicMember } from "../types/api.js";

export const listWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AppError("Authentication required", 401);
  }
  await ensurePersonalWorkspace(user);

  const memberships = await Membership.find({ userId: user.id });
  const ids = memberships.map((m) => m.workspaceId);
  const workspaces = await Workspace.find({ _id: { $in: ids } });
  const byId = new Map(workspaces.map((w) => [w.id, w]));

  const items = memberships
    .map((m) => {
      const workspace = byId.get(String(m.workspaceId));
      if (!workspace) return null;
      return toPublicWorkspace(workspace, m.role);
    })
    .filter((item) => item !== null);

  res.json({ items });
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = req.params.id;
  const membership = await Membership.findOne({
    workspaceId,
    userId: req.user?.id,
  });
  if (!membership) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  const memberships = await Membership.find({ workspaceId });
  const users = await User.find({
    _id: { $in: memberships.map((m) => m.userId) },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const items: PublicMember[] = memberships
    .map((m) => {
      const u = userById.get(String(m.userId));
      if (!u) return null;
      return { id: u.id, name: u.name, email: u.email, role: m.role };
    })
    .filter((item) => item !== null);

  res.json({ items });
});

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = req.params.id;
  const { email } = req.body as z.infer<typeof inviteSchema>;

  const actor = await Membership.findOne({ workspaceId, userId: req.user?.id });
  if (!actor || actor.role !== "owner") {
    throw new AppError("Only the owner can invite members", 403);
  }

  const invitee = await User.findOne({ email: email.toLowerCase() });
  if (!invitee) {
    throw new AppError("No account with that email. Ask them to sign up first.", 400, [
      { path: "email", message: "No account with that email" },
    ]);
  }
  if (invitee.id === req.user?.id) {
    throw new AppError("You are already in this workspace", 400);
  }

  const existing = await Membership.findOne({ workspaceId, userId: invitee.id });
  if (existing) {
    throw new AppError("That person is already a member", 400);
  }

  await Membership.create({
    workspaceId,
    userId: invitee.id,
    role: "member",
  });

  res.status(201).json({
    member: {
      id: invitee.id,
      name: invitee.name,
      email: invitee.email,
      role: "member" as const,
    },
  });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = req.params.id;
  const targetUserId = req.params.userId;
  const actor = await Membership.findOne({ workspaceId, userId: req.user?.id });
  if (!actor) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  const isSelf = targetUserId === req.user?.id;
  if (!isSelf && actor.role !== "owner") {
    throw new AppError("Only the owner can remove members", 403);
  }

  const target = await Membership.findOne({ workspaceId, userId: targetUserId });
  if (!target) {
    throw new AppError("Member not found", 404);
  }
  if (target.role === "owner") {
    throw new AppError("The owner cannot leave or be removed", 400);
  }

  await target.deleteOne();
  res.status(204).send();
});
