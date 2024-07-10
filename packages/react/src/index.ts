export * from './lib/useSoundPlayer';
export * from './lib/useMicrophone';
export * from './lib/VoiceProvider';
export * from './lib/useVoiceClient';
export * from './lib/connection-message';

export {
  type SocketConfig,
  Channels,
  AudioEncoding,
  TTSService,
  type TimeSlice,
  LanguageModelOption,
} from './types';

export type {
  AssistantEnd as AssistantEndMessage,
  AudioInput as AudioMessage,
  AudioOutput as AudioOutputMessage,
  UserInterruption as UserInterruptionMessage,
  AssistantMessage as AssistantTranscriptMessage,
  SubscribeEvent as JSONMessage,
  UserMessage as UserTranscriptMessage,
  ToolCallMessage as ToolCall,
  ToolResponseMessage as ToolResponse,
  ToolErrorMessage as ToolError,
  ChatMetadata as ChatMetadataMessage,
} from 'hume/api/resources/empathicVoice';

export type {
  AssistantEnd,
  AudioInput,
  AudioOutput,
  UserInterruption,
  AssistantMessage,
  SubscribeEvent,
  UserMessage,
  ToolCallMessage,
  ToolResponseMessage,
  ToolErrorMessage,
  ChatMetadata,
} from 'hume/api/resources/empathicVoice';
