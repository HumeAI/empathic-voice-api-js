export * from './lib/embed';

export {
  COLLAPSE_WIDGET_ACTION,
  EXPAND_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  RESIZE_FRAME_ACTION,
  TRANSCRIPT_MESSAGE_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
  parseClientToFrameAction,
  type FrameToClientAction,
  type WindowDimensions,
} from './lib/embed-messages';

export type {
  AssistantTranscriptMessage,
  SocketConfig,
  JSONMessage,
  UserTranscriptMessage,
  EmotionScores,
} from '@humeai/voice';

export { LanguageModelOption } from '@humeai/voice';
