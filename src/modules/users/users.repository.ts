import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

export const usersRepository = {
  async create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.user.create({ data });
  },

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.user.findUnique({ where: { id } });
  },
};
