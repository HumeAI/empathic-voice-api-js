import z from 'zod';

export const ChatMetadataMessageSchema = z
  .object({
    type: z.literal('chat_metadata'),
    chat_id: z.string(),
    chat_group_id: z.string(),
    request_id: z.string(),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type ChatMetadataMessage = z.infer<typeof ChatMetadataMessageSchema>;
