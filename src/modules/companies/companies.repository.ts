import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

export const companiesRepository = {
  async create(data: Prisma.CompanyCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.company.create({ data });
  },
};
