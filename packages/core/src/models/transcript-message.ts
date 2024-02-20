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

export const UserTranscriptMessageSchema = z.object({
  type: z.literal('user_message'),
  message: z.object({
    role: z.literal('user'),
    content: z.string(),
  }),
  models: TranscriptModelsSchema,
});

export const VoiceTranscriptMessageSchema = z.object({
  type: z.literal('voice_message'),
  id: z.string(),
  message: z.object({
    role: z.literal('voice'),
    content: z.string(),
  }),
  models: TranscriptModelsSchema,
});

export const TranscriptMessageSchema = z
  .union([UserTranscriptMessageSchema, VoiceTranscriptMessageSchema])
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;
