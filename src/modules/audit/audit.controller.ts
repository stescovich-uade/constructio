import type { Request, Response } from "express";

/**
 * Reserved for future authenticated audit export endpoints.
 */
export function auditNotImplemented(_req: Request, res: Response): void {
  res.status(501).json({ error: { message: "Not implemented" } });
}
