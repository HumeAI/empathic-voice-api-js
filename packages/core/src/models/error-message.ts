import { z } from 'zod';

export const JSONErrorMessageSchema = z
  .object({
    type: z.literal('error'),
    code: z.string(),
    slug: z.string(),
    message: z.string(),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type JSONErrorMessage = z.infer<typeof JSONErrorMessageSchema>;
