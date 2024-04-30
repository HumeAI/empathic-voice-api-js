import z from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

// MARK: ToolCall Message
export const ToolCallSchema = z
  .object({
    type: z.literal('tool_call'),
    tool_type: z.enum(['builtin', 'function']),
    tool_call_id: z.string(),
    response_required: z.boolean(),
    name: z.string(),
    parameters: z.string(),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type ToolCall = z.infer<typeof ToolCallSchema>;

// MARK: ToolResponse Message
export const ToolResponseContentSchema = z.union([z.string(), jsonSchema]);

export type ToolResponseContent = z.infer<typeof ToolResponseContentSchema>;

export const ToolResponseSchema = z
  .object({
    type: z.literal('tool_response'),
    tool_call_id: z.string(),
    content: ToolResponseContentSchema,
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type ToolResponse = z.infer<typeof ToolResponseSchema>;

// MARK: ToolError Message
export const ToolErrorSchema = z
  .object({
    type: z.literal('tool_error'),
    tool_call_id: z.string(),
    content: z.string().nullish(),
    error: z.string(),
    code: z.string(),
    level: z.string(),
  })
  .transform((obj) => {
    return Object.assign(obj, {
      receivedAt: new Date(),
    });
  });

export type ToolError = z.infer<typeof ToolErrorSchema>;
