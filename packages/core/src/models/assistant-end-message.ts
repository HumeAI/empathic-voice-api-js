import z from 'zod';

export const AssistantEndMessageSchema = z
  .object({
    type: z.literal('assistant_end'),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type AssistantEndMessage = z.infer<typeof AssistantEndMessageSchema>;
