export * from './lib/useSoundPlayer';
export * from './lib/useMicrophone';
export * from './lib/VoiceProvider';
export * from './lib/useVoiceClient';
export * from './lib/connection-message';

export {
  type SocketConfig,
  Channels,
  TTSService,
  AudioEncoding,
  type AssistantEndMessage,
  type AssistantTranscriptMessage,
  type AudioMessage,
  type AudioOutputMessage,
  type JSONMessage,
  type TimeSlice,
  type UserInterruptionMessage,
  type UserTranscriptMessage,
  type ToolCall,
  type ToolResponse,
  type ToolError,
  type ChatMetadataMessage,
  LanguageModelOption,
} from '@humeai/voice';
