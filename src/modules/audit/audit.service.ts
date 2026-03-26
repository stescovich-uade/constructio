import type { Prisma } from "@prisma/client";
import { auditRepository } from "./audit.repository.js";

export const AUDIT_ACTIONS = {
  COMPANY_CREATED: "COMPANY_CREATED",
  USER_CREATED: "USER_CREATED",
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_COMPANY_ADDED: "PROJECT_COMPANY_ADDED",
  THREAD_CREATED: "THREAD_CREATED",
  DOCUMENT_CREATED: "DOCUMENT_CREATED",
  DOCUMENT_VERSION_CREATED: "DOCUMENT_VERSION_CREATED",
  DOCUMENT_VERSION_PROMOTED_TO_APTO: "DOCUMENT_VERSION_PROMOTED_TO_APTO",
} as const;

export const ENTITY_TYPES = {
  Company: "Company",
  User: "User",
  Project: "Project",
  ProjectCompany: "ProjectCompany",
  Thread: "Thread",
  Document: "Document",
  DocumentVersion: "DocumentVersion",
} as const;

export type AuditLogInput = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export const auditService = {
  async log(input: AuditLogInput, tx?: Prisma.TransactionClient) {
    return auditRepository.create(
      {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        user: input.userId ? { connect: { id: input.userId } } : undefined,
      },
      tx,
    );
  },
};
