import z from 'zod';

export const AgentEndMessageSchema = z
  .object({
    type: z.literal('assistant_end'),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type AgentEndMessage = z.infer<typeof AgentEndMessageSchema>;
