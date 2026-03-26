import { prisma } from "../../core/database/prisma.js";

export const rfiRepository = {
  async health() {
    return prisma.rFI.count();
  },
};
