export * from './lib/connection-message';
export * from './lib/useMicrophone';
export * from './lib/useSoundPlayer';
export * from './lib/useVoiceClient';
export * from './lib/VoiceProvider';

export {
  AudioEncoding,
  Channels,
  LanguageModelOption,
  TTSService,
  type TimeSlice,
} from './types';

export type {
  AssistantEnd as AssistantEndMessage,
  AssistantMessage as AssistantTranscriptMessage,
  AudioInput as AudioMessage,
  AudioOutput as AudioOutputMessage,
  ChatMetadata as ChatMetadataMessage,
  WebSocketError as JSONErrorMessage,
  SubscribeEvent as JSONMessage,
  ToolCallMessage as ToolCall,
  ToolErrorMessage as ToolError,
  ToolResponseMessage as ToolResponse,
  UserInterruption as UserInterruptionMessage,
  UserMessage as UserTranscriptMessage,
} from 'hume/api/resources/empathicVoice';

export type { SocketConfig } from './lib/useVoiceClient';

import {
  AssistantEnd as OriginalAssistantEnd,
  AssistantMessage as OriginalAssistantMessage,
  AudioInput as OriginalAudioInput,
  AudioOutput as OriginalAudioOutput,
  ChatMetadata as OriginalChatMetadata,
  SubscribeEvent as OriginalSubscribeEvent,
  ToolCallMessage as OriginalToolCallMessage,
  ToolErrorMessage as OriginalToolErrorMessage,
  ToolResponseMessage as OriginalToolResponseMessage,
  UserInterruption as OriginalUserInterruption,
  UserMessage as OriginalUserMessage,
} from 'hume/api/resources/empathicVoice';

type WithReceivedAt<T> = T & { receivedAt: Date };

export type AssistantEnd = WithReceivedAt<OriginalAssistantEnd>;
export type AssistantMessage = WithReceivedAt<OriginalAssistantMessage>;
export type AudioInput = WithReceivedAt<OriginalAudioInput>;
export type AudioOutput = WithReceivedAt<OriginalAudioOutput>;
export type ChatMetadata = WithReceivedAt<OriginalChatMetadata>;
export type SubscribeEvent = WithReceivedAt<OriginalSubscribeEvent>;
export type ToolCallMessage = WithReceivedAt<OriginalToolCallMessage>;
export type ToolErrorMessage = WithReceivedAt<OriginalToolErrorMessage>;
export type ToolResponseMessage = WithReceivedAt<OriginalToolResponseMessage>;
export type UserInterruption = WithReceivedAt<OriginalUserInterruption>;
export type UserMessage = WithReceivedAt<OriginalUserMessage>;
