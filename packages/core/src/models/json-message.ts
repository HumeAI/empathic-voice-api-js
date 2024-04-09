import z from 'zod';

import { AssistantEndMessageSchema } from './assistant-end-message';
import { AssistantTranscriptMessageSchema } from './assistant-message';
import { AudioOutputMessageSchema } from './audio-output-message';
import { JSONErrorMessageSchema } from './error-message';
import { UserInterruptionMessageSchema } from './user-interruption-message';
import { UserTranscriptMessageSchema } from './user-message';

export const JSONMessageSchema = z.union([
  AudioOutputMessageSchema,
  AssistantEndMessageSchema,
  UserInterruptionMessageSchema,
  UserTranscriptMessageSchema,
  AssistantTranscriptMessageSchema,
  JSONErrorMessageSchema,
]);

export type JSONMessage = z.infer<typeof JSONMessageSchema>;
