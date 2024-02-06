import z from 'zod';

export const AuthStrategy = z.union([
  z.object({
    type: z.literal('apiKey'),
    value: z.string({
      description: 'API key for the Hume API is required',
    }),
  }),
  z.object({
    type: z.literal('access_token'),
    value: z.string({
      description: 'Access token for the Hume API is required',
    }),
  }),
]);
