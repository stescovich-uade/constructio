import { z } from "zod";

/** Trim, require non-empty, uppercase — service applies the same normalization for defense in depth. */
const threadField = z
  .string()
  .max(256)
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "Cannot be empty")
  .transform((value) => value.toUpperCase());

export const createThreadBodySchema = z.object({
  projectId: z.string().uuid(),
  discipline: threadField,
  level: threadField,
  typology: threadField,
});

export type CreateThreadBody = z.infer<typeof createThreadBodySchema>;
