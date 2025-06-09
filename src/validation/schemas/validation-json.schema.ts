import { z } from 'zod';

export const ValidationJsonSchema = z.object({
  templateName: z.string(),
  ownerId: z.string(),
  promptTemplate: z.string(),
  jsonSchema: z.object({}),
});

export type ValidationJson = z.infer<typeof ValidationJsonSchema>;
