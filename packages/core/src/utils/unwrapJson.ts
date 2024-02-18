import type { ZodSchema } from 'zod';

import { safeJson } from './safeJson';

export const unwrapJson = <T extends ZodSchema>(
  input: string,
  schema: T,
): T['_output'] | null => {
  const json = safeJson(input);

  if (!json.success) {
    return null;
  }

  const message = schema.safeParse(json.data);

  if (!message.success) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return message.data;
};
