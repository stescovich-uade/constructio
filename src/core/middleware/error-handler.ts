import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error.js";
import { getEnv } from "../../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        issues: err.flatten(),
      },
    });
    return;
  }

  const env = (() => {
    try {
      return getEnv();
    } catch {
      return { NODE_ENV: "development" as const };
    }
  })();

  if (env.NODE_ENV !== "production" && err instanceof Error) {
    res.status(500).json({
      error: {
        message: "Internal server error",
        details: err.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
}
