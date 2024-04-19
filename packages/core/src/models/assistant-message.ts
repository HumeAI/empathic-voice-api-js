import z from 'zod';

import { TranscriptModelsSchema } from './transcript-models';

export const AssistantTranscriptMessageSchema = z
  .object({
    type: z.literal('assistant_message'),
    id: z.string(),
    message: z.object({
      role: z.literal('assistant'),
      content: z.string(),
    }),
    models: TranscriptModelsSchema,
    from_text: z.boolean().catch(false),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type AssistantTranscriptMessage = z.infer<
  typeof AssistantTranscriptMessageSchema
>;
