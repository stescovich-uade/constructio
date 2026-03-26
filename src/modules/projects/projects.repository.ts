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
};
