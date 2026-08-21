import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import mongoose from "mongoose";
import type { z } from "zod";
import { Membership } from "../models/Membership.js";
import { Task, type TaskDocument } from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toPublicTask } from "../utils/mappers.js";
import type {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "../validators/taskValidators.js";

const priorityRank: Record<string, number> = { low: 1, medium: 2, high: 3 };

async function resolveAssignee(
  workspaceId: string,
  assigneeId: string | null | undefined,
): Promise<mongoose.Types.ObjectId | null | undefined> {
  if (assigneeId === undefined) return undefined;
  if (assigneeId === null) return null;
  if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
    throw new AppError("Invalid assignee", 400);
  }
  const member = await Membership.findOne({ workspaceId, userId: assigneeId });
  if (!member) {
    throw new AppError("Assignee must be a workspace member", 400);
  }
  return new mongoose.Types.ObjectId(assigneeId);
}

function workspaceFilter(req: Request): FilterQuery<TaskDocument> {
  return { workspaceId: new mongoose.Types.ObjectId(req.workspace?.id) };
}

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as z.infer<typeof listTasksQuerySchema>;
  const { status, priority, search, page, limit, sort, order, assignedToMe } = query;

  const filter: FilterQuery<TaskDocument> = workspaceFilter(req);
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedToMe) filter.assigneeId = new mongoose.Types.ObjectId(req.user?.id);
  if (search) {
    filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const skip = (page - 1) * limit;
  const direction = order === "asc" ? 1 : -1;

  let items: TaskDocument[];
  if (sort === "priority") {
    const all = await Task.find(filter).lean(false);
    all.sort((a, b) => {
      const diff = (priorityRank[a.priority] - priorityRank[b.priority]) * direction;
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    items = all.slice(skip, skip + limit);
  } else if (sort === "dueDate") {
    items = await Task.find(filter).sort({ dueDate: direction }).skip(skip).limit(limit);
  } else {
    items = await Task.find(filter).sort({ createdAt: direction }).skip(skip).limit(limit);
  }

  const total = await Task.countDocuments(filter);
  res.json({
    items: items.map(toPublicTask),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof createTaskSchema>;
  const workspaceId = req.workspace?.id;
  const userId = req.user?.id;
  const assigneeId = await resolveAssignee(workspaceId ?? "", body.assigneeId);

  const task = await Task.create({
    workspaceId,
    createdBy: userId,
    userId,
    assigneeId: assigneeId ?? null,
    title: body.title,
    description: body.description ?? "",
    status: body.status ?? "todo",
    priority: body.priority ?? "medium",
    dueDate: body.dueDate ?? null,
  });
  res.status(201).json({ task: toPublicTask(task) });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, ...workspaceFilter(req) });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.json({ task: toPublicTask(task) });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof updateTaskSchema>;
  const patch: Record<string, unknown> = { ...body };
  if (body.assigneeId !== undefined) {
    patch.assigneeId = await resolveAssignee(req.workspace?.id ?? "", body.assigneeId);
  }
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, ...workspaceFilter(req) },
    patch,
    { new: true },
  );
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.json({ task: toPublicTask(task) });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    ...workspaceFilter(req),
  });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.status(204).send();
});
