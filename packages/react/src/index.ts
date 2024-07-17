import { type Hume } from 'hume';

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

export type SocketConfig = Hume.empathicVoice.chat.Chat.ConnectArgs &
  Hume.empathicVoice.chat.Chat.Options;

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

export type {
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
} from 'hume/api/resources/empathicVoice';
