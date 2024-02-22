import z from 'zod';

export const TranscriptModelsSchema = z.array(
  z.object({
    model: z.string(),
    entries: z.array(
      z.object({
        name: z.string(),
        score: z.number(),
      }),
    ),
    time: z
      .object({
        begin: z.number(),
        end: z.number(),
      })
      .nullish(),
  }),
);
