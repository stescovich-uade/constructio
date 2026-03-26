import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../core/errors/http-error.js";

const uuidSchema = z.string().uuid();

/**
 * Mock auth: send `X-User-Id` and `X-Company-Id` (UUID) to simulate JWT claims.
 * Structure is ready to swap for real JWT validation without changing controllers.
 */
export function mockAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.header("x-user-id");
  const companyId = req.header("x-company-id");

  if (userId === undefined && companyId === undefined) {
    next();
    return;
  }

  if (userId === undefined || companyId === undefined) {
    next(new HttpError(401, "Both X-User-Id and X-Company-Id are required for mock auth"));
    return;
  }

  const parsedUser = uuidSchema.safeParse(userId);
  const parsedCompany = uuidSchema.safeParse(companyId);

  if (!parsedUser.success || !parsedCompany.success) {
    next(new HttpError(401, "Invalid mock auth headers (expected UUID)"));
    return;
  }

  req.auth = { userId: parsedUser.data, companyId: parsedCompany.data };
  next();
}

export function requireMockAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    next(new HttpError(401, "Authentication required"));
    return;
  }
  next();
}
