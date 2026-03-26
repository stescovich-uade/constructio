import type { Request, Response } from "express";
import {
  addCompanyToProjectBodySchema,
  addCompanyToProjectParamsSchema,
  createProjectBodySchema,
} from "./projects.schemas.js";
import { projectsService } from "./projects.service.js";

export async function createProject(req: Request, res: Response): Promise<void> {
  const body = createProjectBodySchema.parse(req.body);
  const result = await projectsService.createProject(body, req.auth?.userId ?? null);
  res.status(201).json({ data: result });
}

export async function addCompanyToProject(req: Request, res: Response): Promise<void> {
  const params = addCompanyToProjectParamsSchema.parse(req.params);
  const body = addCompanyToProjectBodySchema.parse(req.body);
  const link = await projectsService.addCompanyToProject(params.projectId, body, req.auth?.userId ?? null);
  res.status(201).json({ data: link });
}
