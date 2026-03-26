import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";
import { HttpError } from "../../core/errors/http-error.js";
import { isPrismaUniqueViolation } from "../../core/utils/prisma-errors.js";
import { AUDIT_ACTIONS, ENTITY_TYPES, auditService } from "../audit/audit.service.js";
import type { CreateUserBody } from "./users.schemas.js";
import { usersRepository } from "./users.repository.js";

export const usersService = {
  async createUser(input: CreateUserBody, auditUserId?: string | null) {
    const company = await prisma.company.findUnique({ where: { id: input.companyId } });
    if (!company) {
      throw new HttpError(400, "Company not found");
    }

    const id = randomUUID();
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await usersRepository.create(
          {
            id,
            email: input.email.toLowerCase().trim(),
            name: input.name.trim(),
            company: { connect: { id: input.companyId } },
            role: input.role,
          },
          tx,
        );
        await auditService.log(
          {
            userId: auditUserId ?? null,
            action: AUDIT_ACTIONS.USER_CREATED,
            entityType: ENTITY_TYPES.User,
            entityId: user.id,
            metadata: { email: user.email, companyId: user.companyId, role: user.role },
          },
          tx,
        );
        return user;
      });
    } catch (error: unknown) {
      if (isPrismaUniqueViolation(error)) {
        throw new HttpError(409, "Email already registered");
      }
      throw error;
    }
  },
};
