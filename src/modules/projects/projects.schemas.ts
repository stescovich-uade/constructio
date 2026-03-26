import { ProjectRole } from "@prisma/client";
import { z } from "zod";

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(256),
  ownerCompanyId: z.string().uuid(),
  ownerRole: z.nativeEnum(ProjectRole).optional(),
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;

export const addCompanyToProjectParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const addCompanyToProjectBodySchema = z.object({
  companyId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole),
});

export type AddCompanyToProjectBody = z.infer<typeof addCompanyToProjectBodySchema>;
