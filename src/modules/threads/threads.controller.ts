import type { Request, Response } from "express";
import { HttpError } from "../../core/errors/http-error.js";
import { createThreadBodySchema } from "./threads.schemas.js";
import { threadsService } from "./threads.service.js";

export async function createThread(req: Request, res: Response): Promise<void> {
  const auth = req.auth;
  if (!auth) {
    throw new HttpError(500, "Authentication context missing");
  }

  const body = createThreadBodySchema.parse(req.body);
  const thread = await threadsService.createThread(body, auth.companyId, auth.userId);
  res.status(201).json({ data: thread });
}
