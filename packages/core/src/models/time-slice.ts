import { z } from 'zod';

export const TimeSliceSchema = z.object({
  begin: z.number(),
  end: z.number(),
});

export type TimeSlice = z.infer<typeof TimeSliceSchema>;
