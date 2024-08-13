export * from './lib/connection-message';
export * from './lib/useMicrophone';
export * from './lib/useSoundPlayer';
export * from './lib/useVoiceClient';
export * from './lib/VoiceProvider';
export * from './lib/errors';
export * from './lib/messages';

export {
  AudioEncoding,
  Channels,
  LanguageModelOption,
  TTSService,
  type TimeSlice,
} from './types';

export type { SocketConfig } from './lib/useVoiceClient';

import type {
  AssistantEnd,
  AssistantMessage,
  AudioInput,
  AudioOutput,
  ChatMetadata,
  SubscribeEvent,
  ToolCallMessage,
  ToolErrorMessage,
  ToolResponseMessage,
  UserInterruption,
  UserMessage,
  WebSocketError,
} from 'hume/api/resources/empathicVoice';

type WithReceivedAt<T> = T & { receivedAt: Date };

export type AssistantEndMessage = WithReceivedAt<AssistantEnd>;
export type AssistantTranscriptMessage = WithReceivedAt<AssistantMessage>;
export type AudioMessage = WithReceivedAt<AudioInput>;
export type AudioOutputMessage = WithReceivedAt<AudioOutput>;
export type ChatMetadataMessage = WithReceivedAt<ChatMetadata>;
export type JSONErrorMessage = WithReceivedAt<WebSocketError>;
export type JSONMessage = WithReceivedAt<SubscribeEvent>;
export type ToolCall = WithReceivedAt<ToolCallMessage>;
export type ToolError = WithReceivedAt<ToolErrorMessage>;
export type ToolResponse = WithReceivedAt<ToolResponseMessage>;
export type UserInterruptionMessage = WithReceivedAt<UserInterruption>;
export type UserTranscriptMessage = WithReceivedAt<UserMessage>;
