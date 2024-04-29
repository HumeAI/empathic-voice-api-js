import z from 'zod';

export const ToolCallSchema = z.object({
  type: z.literal('tool_call'),
  tool_type: z.enum(['built_in', 'function']),
  tool_call_id: z.string(),
  response_required: z.boolean(),
  name: z.string(),
  parameters: z.string(),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResponseSchema = z.object({
  type: z.literal('tool_response'),
  tool_call_id: z.string(),
  content: z.any(),
});

export type ToolResponse = z.infer<typeof ToolResponseSchema>;

export const ToolErrorSchema = z.object({
  type: z.literal('tool_error'),
  tool_call_id: z.string(),
  content: z.string().nullish(),
  error: z.string(),
  code: z.string(),
  level: z.string(),
});

export type ToolError = z.infer<typeof ToolErrorSchema>;
