import { z } from "zod";

export const inviteSchema = z
  .object({
    userId: z.string().min(1).optional(),
    email: z.string().trim().email("Enter a valid email").optional(),
  })
  .refine((value) => Boolean(value.userId || value.email), {
    message: "Choose a person to add",
  });

export const workspaceIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const memberParamsSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});
