import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/database/prisma.js";

export const threadsRepository = {
  async create(data: Prisma.ThreadCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.thread.create({ data });
  },
};
