import z from 'zod';

import { AgentEndMessageSchema } from './agent-end-message';
import { AgentTranscriptMessageSchema } from './agent-message';
import { AudioOutputMessageSchema } from './audio-output-message';
import { UserInterruptionMessageSchema } from './user-interruption-message';
import { UserTranscriptMessageSchema } from './user-message';

export const JSONMessageSchema = z.union([
  AudioOutputMessageSchema,
  AgentEndMessageSchema,
  UserInterruptionMessageSchema,
  UserTranscriptMessageSchema,
  AgentTranscriptMessageSchema,
]);

export type JSONMessage = z.infer<typeof JSONMessageSchema>;
