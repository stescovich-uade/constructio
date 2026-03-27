import type { Prisma } from "@prisma/client";
import { DocumentStatus, DocumentType } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

/**
 * Narrow inputs only — no generic documentVersion.update for APTO.
 * APTO promotion is performed by PostgreSQL function promote_version_to_apto (see migrations).
 */
export type CreateDocumentRowInput = {
  id: string;
  threadId: string;
  type: DocumentType;
};

export type CreateDocumentVersionRowInput = {
  id: string;
  documentId: string;
  threadId: string;
  versionNumber: number;
  fileUrl: string;
};

const versionWithDocumentAndThread = {
  document: { include: { thread: true } },
} as const;

export const documentsRepository = {
  async createDocument(input: CreateDocumentRowInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.document.create({
      data: {
        id: input.id,
        type: input.type,
        thread: { connect: { id: input.threadId } },
      },
    });
  },

  async findDocumentByIdWithThread(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.document.findUnique({
      where: { id },
      include: { thread: true },
    });
  },

  async findMainDocumentForThread(threadId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.document.findFirst({
      where: { threadId, type: DocumentType.MAIN },
    });
  },

  async findVersionById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.documentVersion.findUnique({
      where: { id },
      include: versionWithDocumentAndThread,
    });
  },

  async findVersionByIdWithReviews(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.documentVersion.findUnique({
      where: { id },
      include: { ...versionWithDocumentAndThread, reviews: true },
    });
  },

  async getMaxVersionNumber(documentId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx ?? prisma;
    const agg = await client.documentVersion.aggregate({
      where: { documentId },
      _max: { versionNumber: true },
    });
    return agg._max.versionNumber ?? 0;
  },

  async clearCurrentForDocument(documentId: string, tx: Prisma.TransactionClient) {
    return tx.documentVersion.updateMany({
      where: { documentId },
      data: { isCurrent: false },
    });
  },

  async insertVersion(input: CreateDocumentVersionRowInput, tx: Prisma.TransactionClient) {
    return tx.documentVersion.create({
      data: {
        id: input.id,
        documentId: input.documentId,
        threadId: input.threadId,
        versionNumber: input.versionNumber,
        fileUrl: input.fileUrl,
        status: DocumentStatus.DRAFT,
        isCurrent: true,
      },
    });
  },
};
