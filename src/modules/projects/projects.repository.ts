import { Prisma } from "@prisma/client";
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

  /** Distinct user ids for all companies linked to the project — single JOIN, one round-trip. */
  async listParticipantUserIds(projectId: string, tx?: Prisma.TransactionClient): Promise<string[]> {
    const client = tx ?? prisma;
    const rows = await client.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT DISTINCT u.id
      FROM "User" u
      INNER JOIN "ProjectCompany" pc ON pc."companyId" = u."companyId"
      WHERE pc."projectId" = ${projectId}
    `);
    return rows.map((r) => r.id);
  },
};
