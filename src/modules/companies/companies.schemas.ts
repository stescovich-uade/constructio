import { z } from "zod";

export const createCompanyBodySchema = z.object({
  name: z.string().min(1).max(256),
});

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
