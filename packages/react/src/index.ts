export * from './lib/EmbeddedVoice';
export * from './lib/useSoundPlayer';
export * from './lib/useMicrophone';
export * from './lib/Voice';
export * from './lib/useVoiceClient';

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
  type JSONMessage,
  type AudioMessage,
  type TranscriptMessage,
} from '@humeai/voice';
