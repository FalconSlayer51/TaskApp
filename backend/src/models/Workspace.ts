import mongoose, { type Document, Schema, Types } from "mongoose";

export interface WorkspaceDocument extends Document {
  name: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

workspaceSchema.index({ ownerId: 1 });

export const Workspace = mongoose.model<WorkspaceDocument>("Workspace", workspaceSchema);
