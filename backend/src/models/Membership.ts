import mongoose, { type Document, Schema, Types } from "mongoose";

export type MembershipRole = "owner" | "member";

export interface MembershipDocument extends Document {
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "member"], required: true },
  },
  { timestamps: true },
);

membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });

export const Membership = mongoose.model<MembershipDocument>(
  "Membership",
  membershipSchema,
);
