import type { Request, Response } from "express";

export function documentsPlaceholder(_req: Request, res: Response): void {
  res.status(501).json({ error: { message: "Documents module not implemented yet" } });
}
