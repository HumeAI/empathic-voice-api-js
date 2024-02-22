export * from './lib/EmbeddedVoice';
export * from './lib/useSoundPlayer';
export * from './lib/useMicrophone';
export * from './lib/Voice';
export * from './lib/useVoiceClient';
export * from './lib/connection-message';

export {
  type Config,
  Channels,
  TTSService,
  AudioEncoding,
  parseClientToFrameAction,
  type FrameToClientAction,
  EXPAND_WIDGET_ACTION,
  COLLAPSE_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
  TRANSCRIPT_MESSAGE_ACTION,
  RESIZE_FRAME_ACTION,
  type AgentEndMessage,
  type AgentTranscriptMessage,
  type AudioMessage,
  type AudioOutputMessage,
  type JSONMessage,
  type TimeSlice,
  type UserInterruptionMessage,
  type UserTranscriptMessage,
} from '@humeai/voice';
