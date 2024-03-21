import z from 'zod';

export const EmotionScoresSchema = z.record(z.string(), z.number());

export type EmotionScores = z.infer<typeof EmotionScoresSchema>;

export const TranscriptModelsSchema = z.object({
  // prosody scores are null when the message is not audio
  // (e.g. text input from the user)
  prosody: z
    .object({
      scores: EmotionScoresSchema,
    })
    .nullish(),
  time: z
    .object({
      begin: z.number(),
      end: z.number(),
    })
    .nullish(),
});
