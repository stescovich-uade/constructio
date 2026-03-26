import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { projectsRepository } from "../projects/projects.repository.js";

/**
 * Ensures the user's company participates in the project. Use inside transactions when mutating project-scoped data.
 */
export async function assertUserInProject(
  userId: string,
  projectId: string,
  tx?: Prisma.TransactionClient,
): Promise<{ companyId: string }> {
  const client = tx ?? prisma;
  const user = await client.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const membership = await projectsRepository.findMembership(projectId, user.companyId, tx);
  if (!membership) {
    throw new HttpError(403, "Company is not a participant in this project");
  }

  return { companyId: user.companyId };
}
