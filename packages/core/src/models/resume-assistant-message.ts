import z from 'zod';

export const ResumeAssistantMessageSchema = z.object({
  type: z.literal('resume_assistant_message'),
});

export type ResumeAssistantMessage = z.infer<
  typeof ResumeAssistantMessageSchema
>;
