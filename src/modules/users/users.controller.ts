import type { Request, Response } from "express";
import { createUserBodySchema } from "./users.schemas.js";
import { usersService } from "./users.service.js";

export async function createUser(req: Request, res: Response): Promise<void> {
  const body = createUserBodySchema.parse(req.body);
  const user = await usersService.createUser(body, req.auth?.userId ?? null);
  res.status(201).json({ data: user });
}
