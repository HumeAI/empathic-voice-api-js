import z from 'zod';

export const PauseAssistantMessageSchema = z.object({
  type: z.literal('pause_assistant_message'),
});

export type PauseAssistantMessage = z.infer<typeof PauseAssistantMessageSchema>;
