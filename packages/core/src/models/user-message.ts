import z from 'zod';

import { TranscriptModelsSchema } from './transcript-models';

export const UserTranscriptMessageSchema = z
  .object({
    type: z.literal('user_message'),
    message: z.object({
      role: z.literal('user'),
      content: z.string(),
    }),
    models: TranscriptModelsSchema,
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type UserTranscriptMessage = z.infer<typeof UserTranscriptMessageSchema>;
