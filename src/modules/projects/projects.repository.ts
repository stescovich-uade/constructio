import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

export const projectsRepository = {
  async createProject(data: Prisma.ProjectCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.project.create({ data });
  },

  async createProjectCompany(data: Prisma.ProjectCompanyCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.projectCompany.create({ data });
  },

  async findProjectById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.project.findUnique({ where: { id } });
  },

  async findMembership(projectId: string, companyId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.projectCompany.findUnique({
      where: { projectId_companyId: { projectId, companyId } },
    });
  },

  /** Distinct user ids for all companies linked to the project (from DB). */
  async listParticipantUserIds(projectId: string, tx?: Prisma.TransactionClient): Promise<string[]> {
    const client = tx ?? prisma;
    const links = await client.projectCompany.findMany({
      where: { projectId },
      select: { companyId: true },
    });
    const companyIds = links.map((l) => l.companyId);
    if (companyIds.length === 0) {
      return [];
    }
    const users = await client.user.findMany({
      where: { companyId: { in: companyIds } },
      select: { id: true },
    });
    return [...new Set(users.map((u) => u.id))];
  },
};
