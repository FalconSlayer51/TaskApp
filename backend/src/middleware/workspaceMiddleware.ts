import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Membership } from "../models/Membership.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { ensurePersonalWorkspace } from "../utils/workspaces.js";

export const requireWorkspaceMember = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const headerId = req.header("x-workspace-id")?.trim();
    let workspaceId = headerId && mongoose.Types.ObjectId.isValid(headerId) ? headerId : "";

    if (!workspaceId) {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError("Authentication required", 401);
      }
      const personal = await ensurePersonalWorkspace(user);
      workspaceId = personal.id;
    }

    const membership = await Membership.findOne({
      workspaceId,
      userId: req.user.id,
    });
    if (!membership) {
      throw new AppError("You are not a member of this workspace", 403);
    }

    req.workspace = { id: String(membership.workspaceId), role: membership.role };
    next();
  },
);
