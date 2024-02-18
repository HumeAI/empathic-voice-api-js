import z from 'zod';

export const TranscriptMessageSchema = z
  .object({
    type: z.enum(['user_message', 'assistant_message']),
    id: z.string(),
    message: z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
    models: z.array(
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
    ),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;
