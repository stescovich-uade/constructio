import type { Request, Response } from "express";

export function rfiPlaceholder(_req: Request, res: Response): void {
  res.status(501).json({ error: { message: "RFI module not implemented yet" } });
}
