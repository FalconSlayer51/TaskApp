import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken, toPublicUser } from "../utils/mappers.js";
import { ensurePersonalWorkspace } from "../utils/workspaces.js";
import type { loginSchema, registerSchema, updateMeSchema } from "../validators/authValidators.js";
import type { z } from "zod";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email is already registered", 400, [
      { path: "email", message: "Email is already registered" },
    ]);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: "user" });
  await ensurePersonalWorkspace(user);
  const token = signToken(user.id);

  res.status(201).json({ token, user: toPublicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid email or password", 400);
  }

  const token = signToken(user.id);
  res.json({ token, user: toPublicUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AppError("Authentication required", 401);
  }
  res.json({ user: toPublicUser(user) });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as z.infer<typeof updateMeSchema>;
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { name },
    { new: true },
  );
  if (!user) {
    throw new AppError("Authentication required", 401);
  }
  res.json({ user: toPublicUser(user) });
});
