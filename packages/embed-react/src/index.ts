export * from './lib/EmbeddedVoice';

export {
  COLLAPSE_WIDGET_ACTION,
  EXPAND_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  RESIZE_FRAME_ACTION,
  TRANSCRIPT_MESSAGE_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
  parseClientToFrameAction,
  LanguageModelOption,
} from '@humeai/voice-embed';

export type {
  AssistantTranscriptMessage,
  SocketConfig,
  FrameToClientAction,
  JSONMessage,
  UserTranscriptMessage,
  WindowDimensions,
  EmotionScores,
} from '@humeai/voice-embed';
