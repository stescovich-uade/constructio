import type { Request, Response } from "express";
import { getMockSession } from "./auth.service.js";

export function getMe(req: Request, res: Response): void {
  const session = getMockSession(req.auth);
  res.status(200).json({ data: session });
}
