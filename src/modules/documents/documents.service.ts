import { randomUUID } from "node:crypto";
import { DocumentType, Prisma, VersionStatus } from "@prisma/client";
import type { Document, DocumentVersion } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { isPrismaUniqueViolation } from "../../core/utils/prisma-errors.js";
import { assertUserInProject } from "../auth/authorization.service.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import { documentsRepository } from "./documents.repository.js";

export type CreateDocumentParams = {
  userId: string;
  threadId: string;
  type: DocumentType;
  documentId: string;
  tx: Prisma.TransactionClient;
};

export type CreateVersionParams = {
  userId: string;
  documentId: string;
  fileUrl: string;
};

function isDocumentVersionNotFoundFromDb(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("DocumentVersion not found");
}

export const documentsService = {
  /**
   * Creates a document for a thread. MAIN is rejected if the thread already has one.
   * Must be called from code paths that already hold `tx` when part of a larger transaction.
   */
  async createDocument(params: CreateDocumentParams): Promise<Document> {
    const thread = await params.tx.thread.findUnique({ where: { id: params.threadId } });
    if (!thread) {
      throw new HttpError(404, "Thread not found");
    }

    await assertUserInProject(params.userId, thread.projectId, params.tx);

    if (params.type === DocumentType.MAIN) {
      const existingMain = await documentsRepository.findMainDocumentForThread(params.threadId, params.tx);
      if (existingMain) {
        throw new HttpError(409, "Thread already has a MAIN document");
      }
    }

    const document = await documentsRepository.createDocument(
      {
        id: params.documentId,
        threadId: params.threadId,
        type: params.type,
      },
      params.tx,
    );

    await auditService.log(
      {
        userId: params.userId,
        action: AUDIT_ACTIONS.DOCUMENT_CREATED,
        entityType: ENTITY_TYPES.Document,
        entityId: document.id,
        metadata: {
          projectId: thread.projectId,
          threadId: params.threadId,
          documentId: document.id,
          type: params.type,
        },
      },
      params.tx,
    );

    return document;
  },

  /**
   * Appends the next linear version: versionNumber = max + 1, sole isCurrent on this document.
   */
  async createVersion(params: CreateVersionParams): Promise<DocumentVersion> {
    const fileUrl = params.fileUrl.trim();
    if (fileUrl.length === 0) {
      throw new HttpError(400, "fileUrl is required");
    }

    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const document = await documentsRepository.findDocumentByIdWithThread(params.documentId, tx);
        if (!document) {
          throw new HttpError(404, "Document not found");
        }

        await assertUserInProject(params.userId, document.thread.projectId, tx);

        const maxVersion = await documentsRepository.getMaxVersionNumber(params.documentId, tx);
        const nextNumber = maxVersion + 1;

        await tx.documentVersion.updateMany({
          where: { documentId: params.documentId, status: VersionStatus.APTO },
          data: { status: VersionStatus.SUPERSEDED, isCurrent: false },
        });

        await documentsRepository.clearCurrentForDocument(params.documentId, tx);

        const version = await documentsRepository.insertVersion(
          {
            id: randomUUID(),
            documentId: params.documentId,
            threadId: document.threadId,
            versionNumber: nextNumber,
            fileUrl,
          },
          tx,
        );

        await auditService.log(
          {
            userId: params.userId,
            action: AUDIT_ACTIONS.DOCUMENT_VERSION_CREATED,
            entityType: ENTITY_TYPES.DocumentVersion,
            entityId: version.id,
            metadata: {
              projectId: document.thread.projectId,
              threadId: document.threadId,
              documentId: version.documentId,
              versionNumber: version.versionNumber,
            },
          },
          tx,
        );

        return version;
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Version numbering or current-version constraint violated");
      }
      throw error;
    }
  },

  /**
   * Promotes a version to APTO. Mutation is delegated to PostgreSQL promote_version_to_apto();
   * this service keeps authorization, audit, and pre-checks only.
   */
  async promoteVersionToApto(documentVersionId: string, userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const version = await documentsRepository.findVersionById(documentVersionId, tx);
        if (!version) {
          throw new HttpError(404, "DocumentVersion not found");
        }

        if (version.threadId !== version.document.threadId) {
          throw new HttpError(409, "DocumentVersion threadId does not match parent document");
        }

        const projectId = version.document.thread.projectId;
        await assertUserInProject(userId, projectId, tx);

        await tx.$executeRaw(Prisma.sql`SELECT promote_version_to_apto(${documentVersionId})`);

        await auditService.log(
          {
            userId,
            action: AUDIT_ACTIONS.DOCUMENT_VERSION_PROMOTED_TO_APTO,
            entityType: ENTITY_TYPES.DocumentVersion,
            entityId: documentVersionId,
            metadata: {
              projectId,
              threadId: version.threadId,
              documentId: version.documentId,
            },
          },
          tx,
        );
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (isDocumentVersionNotFoundFromDb(error)) {
        throw new HttpError(404, "DocumentVersion not found");
      }
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(
          409,
          "Cannot set APTO: thread already has an APTO version or current-version constraint violated",
        );
      }
      throw error;
    }
  },
};
