import z from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

export const ToolCallSchema = z.object({
  type: z.literal('tool_call'),
  tool_type: z.enum(['builtin', 'function']),
  tool_call_id: z.string(),
  response_required: z.boolean(),
  name: z.string(),
  parameters: z.string(),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResponseSchema = z.object({
  type: z.literal('tool_response'),
  tool_call_id: z.string(),
  content: z.union([z.string(), jsonSchema]),
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
