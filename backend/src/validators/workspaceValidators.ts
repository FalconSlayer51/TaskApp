import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const workspaceIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const memberParamsSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});
