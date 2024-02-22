import z from 'zod';

import { TimeSliceSchema } from './time-slice';

export const UserInterruptionMessageSchema = z
  .object({
    type: z.literal('user_interruption'),
    message: z.object({
      role: z.literal('user'),
      content: z.string(),
    }),
    time: TimeSliceSchema,
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type UserInterruptionMessage = z.infer<
  typeof UserInterruptionMessageSchema
>;
