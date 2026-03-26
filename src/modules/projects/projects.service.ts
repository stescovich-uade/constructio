import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { ProjectRole } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { isPrismaUniqueViolation } from "../../core/utils/prisma-errors.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import type { AddCompanyToProjectBody, CreateProjectBody } from "./projects.schemas.js";
import { projectsRepository } from "./projects.repository.js";

export const projectsService = {
  async createProject(input: CreateProjectBody, auditUserId?: string | null) {
    const ownerCompany = await prisma.company.findUnique({ where: { id: input.ownerCompanyId } });
    if (!ownerCompany) {
      throw new HttpError(400, "Owner company not found");
    }

    const projectId = randomUUID();
    const linkId = randomUUID();
    const ownerRole = input.ownerRole ?? ProjectRole.ARQUITECTURA;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await projectsRepository.createProject(
        {
          id: projectId,
          name: input.name.trim(),
        },
        tx,
      );

      const projectCompany = await projectsRepository.createProjectCompany(
        {
          id: linkId,
          project: { connect: { id: project.id } },
          company: { connect: { id: input.ownerCompanyId } },
          role: ownerRole,
        },
        tx,
      );

      await auditService.log(
        {
          userId: auditUserId ?? null,
          action: AUDIT_ACTIONS.PROJECT_CREATED,
          entityType: ENTITY_TYPES.Project,
          entityId: project.id,
          metadata: { name: project.name, ownerCompanyId: input.ownerCompanyId },
        },
        tx,
      );

      await auditService.log(
        {
          userId: auditUserId ?? null,
          action: AUDIT_ACTIONS.PROJECT_COMPANY_ADDED,
          entityType: ENTITY_TYPES.ProjectCompany,
          entityId: projectCompany.id,
          metadata: {
            projectId: project.id,
            companyId: projectCompany.companyId,
            role: projectCompany.role,
          },
        },
        tx,
      );

      return { project, ownerLink: projectCompany };
    });
  },

  async addCompanyToProject(
    projectId: string,
    input: AddCompanyToProjectBody,
    auditUserId?: string | null,
  ) {
    const project = await projectsRepository.findProjectById(projectId);
    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const company = await prisma.company.findUnique({ where: { id: input.companyId } });
    if (!company) {
      throw new HttpError(400, "Company not found");
    }

    const id = randomUUID();

    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const projectCompany = await projectsRepository.createProjectCompany(
          {
            id,
            project: { connect: { id: projectId } },
            company: { connect: { id: input.companyId } },
            role: input.role,
          },
          tx,
        );

        await auditService.log(
          {
            userId: auditUserId ?? null,
            action: AUDIT_ACTIONS.PROJECT_COMPANY_ADDED,
            entityType: ENTITY_TYPES.ProjectCompany,
            entityId: projectCompany.id,
            metadata: {
              projectId,
              companyId: projectCompany.companyId,
              role: projectCompany.role,
            },
          },
          tx,
        );

        return projectCompany;
      });
    } catch (error: unknown) {
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Company is already linked to this project");
      }
      throw error;
    }
  },
};
