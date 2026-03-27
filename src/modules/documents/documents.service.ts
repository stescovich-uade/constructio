import { randomUUID } from "node:crypto";
import { DocumentStatus, DocumentType, Prisma, ReviewStatus } from "@prisma/client";
import type { Document, DocumentVersion } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { isPrismaUniqueViolation } from "../../core/utils/prisma-errors.js";
import { assertUserInProject } from "../auth/authorization.service.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { projectsRepository } from "../projects/projects.repository.js";
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

export type ReviewDecision = "APPROVED" | "REJECTED";

function getErrorMessageDeep(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause;
    if (cause instanceof Error) {
      return `${error.message} ${cause.message}`;
    }
    return error.message;
  }
  return String(error);
}

/** Maps RAISE from promote_version_to_apto (and driver-wrapped messages). */
function mapPromoteVersionDbError(error: unknown): HttpError | null {
  const message = getErrorMessageDeep(error);
  if (message.includes("DocumentVersion not found")) {
    return new HttpError(404, "DocumentVersion not found");
  }
  if (message.includes("User not found")) {
    return new HttpError(404, "User not found");
  }
  if (message.includes("User not authorized")) {
    return new HttpError(403, "User not authorized for this project");
  }
  if (message.includes("Can only promote to APTO from UNDER_REVIEW")) {
    return new HttpError(409, "Version must be UNDER_REVIEW to promote to APTO");
  }
  if (message.includes("no reviews assigned")) {
    return new HttpError(409, "Cannot promote to APTO: no reviews assigned");
  }
  if (message.includes("not all reviews approved")) {
    return new HttpError(409, "Cannot promote to APTO: not all reviews approved");
  }
  if (message.includes("DocumentVersion locked after submission")) {
    return new HttpError(409, "Document version is locked after submission");
  }
  return null;
}

/** Version uploader from audit, else document creator — always DB-backed user ids. */
async function resolveDocumentStakeholderUserId(
  documentVersionId: string,
  documentId: string,
  tx: Prisma.TransactionClient,
): Promise<string | null> {
  const versionLog = await tx.auditLog.findFirst({
    where: {
      action: AUDIT_ACTIONS.DOCUMENT_VERSION_CREATED,
      entityType: ENTITY_TYPES.DocumentVersion,
      entityId: documentVersionId,
      userId: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });
  if (versionLog?.userId) {
    return versionLog.userId;
  }
  const docLog = await tx.auditLog.findFirst({
    where: {
      action: AUDIT_ACTIONS.DOCUMENT_CREATED,
      entityType: ENTITY_TYPES.Document,
      entityId: documentId,
      userId: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });
  return docLog?.userId ?? null;
}

async function promoteVersionToAptoInTx(
  documentVersionId: string,
  userId: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const version = await documentsRepository.findVersionById(documentVersionId, tx);
  if (!version) {
    throw new HttpError(404, "DocumentVersion not found");
  }

  if (version.threadId !== version.document.threadId) {
    throw new HttpError(409, "DocumentVersion threadId does not match parent document");
  }

  const projectId = version.document.thread.projectId;
  await assertUserInProject(userId, projectId, tx);

  await tx.$executeRaw(
    Prisma.sql`SELECT promote_version_to_apto(${documentVersionId}, ${userId})`,
  );

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

  const aptoRecipients = (await projectsRepository.listParticipantUserIds(projectId, tx)).filter(
    (uid) => uid !== userId,
  );
  await notificationsService.createNotificationsForUsers(
    aptoRecipients,
    "DOCUMENT_APPROVED",
    documentVersionId,
    tx,
  );
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
          where: { documentId: params.documentId, status: DocumentStatus.APTO },
          data: { status: DocumentStatus.SUPERSEDED, isCurrent: false },
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
      const mapped = mapPromoteVersionDbError(error);
      if (mapped) {
        throw mapped;
      }
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Version numbering or current-version constraint violated");
      }
      throw error;
    }
  },

  /**
   * DRAFT → SUBMITTED. Locks content editing at the database for SUBMITTED and later states.
   */
  async submitVersion(documentVersionId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const version = await documentsRepository.findVersionById(documentVersionId, tx);
      if (!version) {
        throw new HttpError(404, "DocumentVersion not found");
      }

      const projectId = version.document.thread.projectId;
      await assertUserInProject(userId, projectId, tx);

      if (version.status !== DocumentStatus.DRAFT) {
        throw new HttpError(409, "Only DRAFT versions can be submitted");
      }

      await tx.documentVersion.update({
        where: { id: documentVersionId },
        data: { status: DocumentStatus.SUBMITTED },
      });

      const participantIds = await projectsRepository.listParticipantUserIds(projectId, tx);
      const submitNotifyRecipients = participantIds.filter((uid) => uid !== userId);
      await notificationsService.createNotificationsForUsers(
        submitNotifyRecipients,
        "DOCUMENT_SUBMITTED",
        documentVersionId,
        tx,
      );
    });
  },

  /**
   * Registers a reviewer. Moves SUBMITTED → UNDER_REVIEW when the first reviewer is added.
   * `userId` is the reviewer. When `assignedByUserId` is omitted, the reviewer is treated as the caller (both must be in the project).
   */
  async assignReviewer(
    documentVersionId: string,
    userId: string,
    assignedByUserId?: string,
  ): Promise<void> {
    const assignerId = assignedByUserId ?? userId;
    try {
      await prisma.$transaction(async (tx) => {
        const version = await documentsRepository.findVersionById(documentVersionId, tx);
        if (!version) {
          throw new HttpError(404, "DocumentVersion not found");
        }

        const projectId = version.document.thread.projectId;
        await assertUserInProject(assignerId, projectId, tx);
        await assertUserInProject(userId, projectId, tx);

        if (version.status !== DocumentStatus.SUBMITTED && version.status !== DocumentStatus.UNDER_REVIEW) {
          throw new HttpError(
            409,
            "Reviewers can only be assigned when the version is SUBMITTED or UNDER_REVIEW",
          );
        }

        const existing = await tx.review.findUnique({
          where: {
            documentVersionId_reviewerId: { documentVersionId, reviewerId: userId },
          },
        });
        if (existing) {
          throw new HttpError(409, "Reviewer already assigned to this version");
        }

        await tx.review.create({
          data: {
            id: randomUUID(),
            documentVersionId,
            reviewerId: userId,
            status: ReviewStatus.PENDING,
          },
        });

        if (version.status === DocumentStatus.SUBMITTED) {
          await tx.documentVersion.update({
            where: { id: documentVersionId },
            data: { status: DocumentStatus.UNDER_REVIEW },
          });
        }

        if (userId !== assignerId) {
          await notificationsService.createNotification(userId, "REVIEW_ASSIGNED", documentVersionId, tx);
        }
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Reviewer already assigned to this version");
      }
      throw error;
    }
  },

  /**
   * Reviewer records a decision. Any REJECTED review sets the version to REJECTED.
   * When every review is APPROVED, promotes to APTO via promote_version_to_apto.
   */
  async reviewVersion(
    documentVersionId: string,
    reviewerId: string,
    decision: ReviewDecision,
    comment: string | null | undefined,
  ): Promise<void> {
    const trimmedComment = comment?.trim() ?? "";
    if (decision === "REJECTED" && trimmedComment.length === 0) {
      throw new HttpError(400, "comment is required when rejecting");
    }

    try {
      await prisma.$transaction(async (tx) => {
        const version = await documentsRepository.findVersionByIdWithReviews(documentVersionId, tx);
        if (!version) {
          throw new HttpError(404, "DocumentVersion not found");
        }

        const projectId = version.document.thread.projectId;
        await assertUserInProject(reviewerId, projectId, tx);

        if (version.status === DocumentStatus.REJECTED || version.status === DocumentStatus.APTO) {
          throw new HttpError(409, "Cannot review a version that is rejected or already approved");
        }
        if (version.status !== DocumentStatus.UNDER_REVIEW) {
          throw new HttpError(409, "Reviews are only accepted while the version is UNDER_REVIEW");
        }

        const review = version.reviews.find((r) => r.reviewerId === reviewerId);
        if (!review) {
          throw new HttpError(403, "You are not assigned as a reviewer for this version");
        }
        if (review.status !== ReviewStatus.PENDING) {
          throw new HttpError(409, "This review has already been completed");
        }

        const newReviewStatus = decision === "APPROVED" ? ReviewStatus.APPROVED : ReviewStatus.REJECTED;

        await tx.review.update({
          where: { id: review.id },
          data: {
            status: newReviewStatus,
            comment: trimmedComment.length > 0 ? trimmedComment : null,
          },
        });

        if (decision === "REJECTED") {
          await tx.review.updateMany({
            where: {
              documentVersionId,
              id: { not: review.id },
              status: ReviewStatus.PENDING,
            },
            data: { status: ReviewStatus.REJECTED, comment: null },
          });
          await tx.documentVersion.update({
            where: { id: documentVersionId },
            data: { status: DocumentStatus.REJECTED },
          });
          const rejectStakeholder = await resolveDocumentStakeholderUserId(
            documentVersionId,
            version.documentId,
            tx,
          );
          if (rejectStakeholder && rejectStakeholder !== reviewerId) {
            await notificationsService.createNotification(
              rejectStakeholder,
              "DOCUMENT_REJECTED",
              documentVersionId,
              tx,
            );
          }
          return;
        }

        const notApproved = await tx.review.count({
          where: { documentVersionId, status: { not: ReviewStatus.APPROVED } },
        });
        if (notApproved > 0) {
          const partialStakeholder = await resolveDocumentStakeholderUserId(
            documentVersionId,
            version.documentId,
            tx,
          );
          if (partialStakeholder && partialStakeholder !== reviewerId) {
            await notificationsService.createNotification(
              partialStakeholder,
              "DOCUMENT_APPROVED_PARTIAL",
              documentVersionId,
              tx,
            );
          }
          return;
        }

        await promoteVersionToAptoInTx(documentVersionId, reviewerId, tx);
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      const mapped = mapPromoteVersionDbError(error);
      if (mapped) {
        throw mapped;
      }
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Review constraint violated");
      }
      throw error;
    }
  },

  /**
   * Promotes a version to APTO. Mutation is delegated to PostgreSQL promote_version_to_apto();
   * requires UNDER_REVIEW, at least one review, and all reviews APPROVED.
   */
  async promoteVersionToApto(documentVersionId: string, userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await promoteVersionToAptoInTx(documentVersionId, userId, tx);
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      const mapped = mapPromoteVersionDbError(error);
      if (mapped) {
        throw mapped;
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
