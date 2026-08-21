import type { UserDocument } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { Membership } from "../models/Membership.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

export async function ensurePersonalWorkspace(user: UserDocument) {
  let workspace = await Workspace.findOne({ ownerId: user.id });
  if (!workspace) {
    workspace = await Workspace.create({
      name: `${user.name}'s workspace`,
      ownerId: user.id,
    });
  }

  await Membership.findOneAndUpdate(
    { workspaceId: workspace.id, userId: user.id },
    { $setOnInsert: { role: "owner" } },
    { upsert: true, new: true },
  );

  await Task.updateMany(
    {
      userId: user.id,
      $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }],
    },
    { $set: { workspaceId: workspace._id, createdBy: user._id } },
  );

  return workspace;
}

export async function migratePersonalWorkspaces(): Promise<void> {
  const users = await User.find();
  for (const user of users) {
    await ensurePersonalWorkspace(user);
  }
}
