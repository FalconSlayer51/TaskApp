import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import type { ApiErrorBody } from "../types/api.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    const body: ApiErrorBody = { message: err.message, errors: err.errors };
    res.status(err.statusCode).json(body);
    return;
  }

  if (typeof err === "object" && err !== null && "name" in err) {
    const named = err as { name: string; message?: string; code?: number };

    if (named.name === "JsonWebTokenError" || named.name === "TokenExpiredError") {
      res.status(401).json({ message: "Invalid or expired token" } satisfies ApiErrorBody);
      return;
    }

    if (named.name === "CastError") {
      res.status(404).json({ message: "Resource not found" } satisfies ApiErrorBody);
      return;
    }

    if (named.name === "MongoServerError" && named.code === 11000) {
      res.status(400).json({
        message: "A record with that value already exists",
        errors: [{ path: "email", message: "Email is already registered" }],
      } satisfies ApiErrorBody);
      return;
    }
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" } satisfies ApiErrorBody);
}
