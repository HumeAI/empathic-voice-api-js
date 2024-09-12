import type {
  AssistantEnd,
  AssistantMessage,
  AudioInput,
  AudioOutput,
  ChatMetadata,
  JsonMessage,
  ToolCallMessage,
  ToolErrorMessage,
  ToolResponseMessage,
  UserInterruption,
  UserMessage,
  WebSocketError,
} from 'hume/api/resources/empathicVoice';
import z from 'zod';

type WithReceivedAt<T> = T & { receivedAt: Date };

export type AssistantEndMessage = WithReceivedAt<AssistantEnd>;
export type AssistantTranscriptMessage = WithReceivedAt<AssistantMessage>;
export type AudioMessage = WithReceivedAt<AudioInput>;
export type AudioOutputMessage = WithReceivedAt<AudioOutput>;
export type ChatMetadataMessage = WithReceivedAt<ChatMetadata>;
export type JSONErrorMessage = WithReceivedAt<WebSocketError>;
export type JSONMessage = WithReceivedAt<JsonMessage>;
export type ToolCall = WithReceivedAt<ToolCallMessage>;
export type ToolError = WithReceivedAt<ToolErrorMessage>;
export type ToolResponse = WithReceivedAt<ToolResponseMessage>;
export type UserInterruptionMessage = WithReceivedAt<UserInterruption>;
export type UserTranscriptMessage = WithReceivedAt<UserMessage>;

export const TimeSliceSchema = z.object({
  begin: z.number(),
  end: z.number(),
});

export type TimeSlice = z.infer<typeof TimeSliceSchema>;
