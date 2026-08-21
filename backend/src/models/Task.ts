import mongoose, { type Document, Schema, Types } from "mongoose";
import type { TaskPriority, TaskStatus } from "../types/api.js";

export interface TaskDocument extends Document {
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  assigneeId: Types.ObjectId | null;
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ workspaceId: 1, createdAt: -1 });
taskSchema.index({ workspaceId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

export const Task = mongoose.model<TaskDocument>("Task", taskSchema);
