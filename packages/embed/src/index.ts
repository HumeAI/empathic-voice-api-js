export * from './lib/embed';

export {
  parseClientToFrameAction,
  type FrameToClientAction,
  EXPAND_WIDGET_ACTION,
  COLLAPSE_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
  TRANSCRIPT_MESSAGE_ACTION,
  RESIZE_FRAME_ACTION,
} from './lib/embed-messages';

export type {
  Config,
  UserTranscriptMessage,
  AgentTranscriptMessage,
  JSONMessage,
} from '@humeai/voice';
