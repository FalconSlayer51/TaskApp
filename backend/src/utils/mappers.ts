import jwt from "jsonwebtoken";
import type { UserDocument } from "../models/User.js";
import type { TaskDocument } from "../models/Task.js";
import type { WorkspaceDocument } from "../models/Workspace.js";
import type { MembershipRole, PublicTask, PublicUser, PublicWorkspace } from "../types/api.js";
import { AppError } from "./AppError.js";

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Server misconfigured", 500);
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toPublicWorkspace(
  workspace: WorkspaceDocument,
  role: MembershipRole,
): PublicWorkspace {
  return {
    id: workspace.id,
    name: workspace.name,
    ownerId: String(workspace.ownerId),
    role,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  };
}

export function toPublicTask(task: TaskDocument): PublicTask {
  return {
    id: task.id,
    workspaceId: task.workspaceId ? String(task.workspaceId) : "",
    createdBy: task.createdBy ? String(task.createdBy) : String(task.userId),
    assigneeId: task.assigneeId ? String(task.assigneeId) : null,
    userId: String(task.userId),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
