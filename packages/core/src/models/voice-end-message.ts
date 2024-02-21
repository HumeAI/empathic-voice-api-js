import z from 'zod';

export const VoiceEndMessageSchema = z
  .object({
    type: z.literal('assistant_end'),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type VoiceEndMessage = z.infer<typeof VoiceEndMessageSchema>;
