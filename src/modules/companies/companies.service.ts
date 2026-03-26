import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import { companiesRepository } from "./companies.repository.js";
import type { CreateCompanyBody } from "./companies.schemas.js";

export const companiesService = {
  async createCompany(input: CreateCompanyBody, auditUserId?: string | null) {
    const id = randomUUID();
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const company = await companiesRepository.create(
        {
          id,
          name: input.name.trim(),
        },
        tx,
      );
      await auditService.log(
        {
          userId: auditUserId ?? null,
          action: AUDIT_ACTIONS.COMPANY_CREATED,
          entityType: ENTITY_TYPES.Company,
          entityId: company.id,
          metadata: { name: company.name },
        },
        tx,
      );
      return company;
    });
  },
};
