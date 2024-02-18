import { z } from 'zod';

export const AudioOutputMessageSchema = z
  .object({
    type: z.literal('audio_output'),
    id: z.string(),
    data: z.string(),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type AudioOutputMessage = z.infer<typeof AudioOutputMessageSchema>;
