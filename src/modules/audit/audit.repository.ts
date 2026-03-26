import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

export const auditRepository = {
  async create(data: Prisma.AuditLogCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.auditLog.create({ data });
  },
};
