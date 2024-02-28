import z from 'zod';

import { TimeSliceSchema } from './time-slice';

export const UserInterruptionMessageSchema = z
  .object({
    type: z.literal('user_interruption'),
    time: z.union([TimeSliceSchema, z.number(), z.null()]).catch(null),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type UserInterruptionMessage = z.infer<
  typeof UserInterruptionMessageSchema
>;
