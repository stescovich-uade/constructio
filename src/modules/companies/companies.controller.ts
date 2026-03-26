import type { Request, Response } from "express";
import { createCompanyBodySchema } from "./companies.schemas.js";
import { companiesService } from "./companies.service.js";

export async function createCompany(req: Request, res: Response): Promise<void> {
  const body = createCompanyBodySchema.parse(req.body);
  const company = await companiesService.createCompany(body, req.auth?.userId ?? null);
  res.status(201).json({ data: company });
}
