import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(4000).optional().default(""),
  status: taskStatusSchema.optional().default("todo"),
  priority: taskPrioritySchema.optional().default("medium"),
  dueDate: z.union([z.coerce.date(), z.null()]).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.union([z.coerce.date(), z.null()]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const taskIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listTasksQuerySchema = z.object({
  status: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    taskStatusSchema.optional(),
  ),
  priority: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    taskPrioritySchema.optional(),
  ),
  search: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().trim().optional(),
  ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(10),
  sort: z.enum(["dueDate", "priority", "createdAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});
