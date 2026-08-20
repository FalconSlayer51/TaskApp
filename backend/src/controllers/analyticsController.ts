import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AnalyticsResponse, TaskPriority, TaskStatus } from "../types/api.js";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user?.id);
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [row] = await Task.aggregate([
    { $match: { userId } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
              },
              inProgress: {
                $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
              },
              todo: {
                $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] },
              },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$status", "done"] },
                        { $ne: ["$dueDate", null] },
                        { $lt: ["$dueDate", now] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              dueThisWeek: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$status", "done"] },
                        { $ne: ["$dueDate", null] },
                        { $gte: ["$dueDate", now] },
                        { $lte: ["$dueDate", weekEnd] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
      },
    },
  ]);

  const totals = row?.totals?.[0] ?? {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0,
    dueThisWeek: 0,
  };

  const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
  const priorities: TaskPriority[] = ["low", "medium", "high"];

  const byStatusMap = new Map<string, number>(
    (row?.byStatus ?? []).map((s: { _id: string; count: number }) => [s._id, s.count]),
  );
  const byPriorityMap = new Map<string, number>(
    (row?.byPriority ?? []).map((s: { _id: string; count: number }) => [s._id, s.count]),
  );

  const payload: AnalyticsResponse = {
    total: totals.total,
    completed: totals.completed,
    pending: totals.todo + totals.inProgress,
    inProgress: totals.inProgress,
    completionPercentage:
      totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
    byStatus: statuses.map((status) => ({
      status,
      count: byStatusMap.get(status) ?? 0,
    })),
    byPriority: priorities.map((priority) => ({
      priority,
      count: byPriorityMap.get(priority) ?? 0,
    })),
    overdue: totals.overdue,
    dueThisWeek: totals.dueThisWeek,
  };

  res.json(payload);
});
