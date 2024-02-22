import z from 'zod';

import { TranscriptModelsSchema } from './transcript-models';

export const AgentTranscriptMessageSchema = z
  .object({
    type: z.literal('assistant_message'),
    id: z.string(),
    message: z.object({
      role: z.literal('assistant'),
      content: z.string(),
    }),
    models: TranscriptModelsSchema,
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type AgentTranscriptMessage = z.infer<
  typeof AgentTranscriptMessageSchema
>;
