import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { DocumentType } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { isPrismaUniqueViolation } from "../../core/utils/prisma-errors.js";
import { assertUserInProject } from "../auth/authorization.service.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import { documentsService } from "../documents/documents.service.js";
import { projectsRepository } from "../projects/projects.repository.js";
import type { CreateThreadBody } from "./threads.schemas.js";
import { threadsRepository } from "./threads.repository.js";

function normalizeThreadFields(input: CreateThreadBody): CreateThreadBody {
  return {
    projectId: input.projectId,
    discipline: input.discipline.trim().toUpperCase(),
    level: input.level.trim().toUpperCase(),
    typology: input.typology.trim().toUpperCase(),
  };
}

export const threadsService = {
  async createThread(input: CreateThreadBody, companyId: string, userId: string) {
    const normalized = normalizeThreadFields(input);

    if (
      normalized.discipline.length === 0 ||
      normalized.level.length === 0 ||
      normalized.typology.length === 0
    ) {
      throw new HttpError(400, "discipline, level, and typology must not be empty");
    }

    const project = await projectsRepository.findProjectById(normalized.projectId);
    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const { companyId: userCompanyId } = await assertUserInProject(userId, normalized.projectId);
    if (userCompanyId !== companyId) {
      throw new HttpError(403, "Company context does not match the user's company");
    }

    const threadId = randomUUID();
    const mainDocumentId = randomUUID();

    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await assertUserInProject(userId, normalized.projectId, tx);

        const thread = await threadsRepository.create(
          {
            id: threadId,
            project: { connect: { id: normalized.projectId } },
            discipline: normalized.discipline,
            level: normalized.level,
            typology: normalized.typology,
          },
          tx,
        );

        await auditService.log(
          {
            userId,
            action: AUDIT_ACTIONS.THREAD_CREATED,
            entityType: ENTITY_TYPES.Thread,
            entityId: thread.id,
            metadata: {
              projectId: thread.projectId,
              threadId: thread.id,
              discipline: thread.discipline,
              level: thread.level,
              typology: thread.typology,
            },
          },
          tx,
        );

        await documentsService.createDocument({
          userId,
          threadId: thread.id,
          type: DocumentType.MAIN,
          documentId: mainDocumentId,
          tx,
        });

        return thread;
      });
    } catch (error: unknown) {
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Thread already exists for this project, discipline, level, and typology");
      }
      throw error;
    }
  },
};
