import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserBodySchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(256),
  companyId: z.string().uuid(),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
