import z from 'zod';

export const EmotionScoresSchema = z.record(z.string(), z.number());

export type EmotionScores = z.infer<typeof EmotionScoresSchema>;

export const TranscriptModelsSchema = z.object({
  prosody: z.object({
    scores: EmotionScoresSchema,
  }),
  time: z
    .object({
      begin: z.number(),
      end: z.number(),
    })
    .nullish(),
});
