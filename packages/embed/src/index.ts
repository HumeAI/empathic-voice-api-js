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
  SubscribeEvent,
  AssistantMessage,
  UserMessage,
  ToolCallMessage,
  ToolResponseMessage,
  ToolErrorMessage,
  ChatMetadata,
} from 'hume/api/resources/empathicVoice';

export type {
  AssistantMessage as AssistantTranscriptMessage,
  SubscribeEvent as JSONMessage,
  UserMessage as UserTranscriptMessage,
  EmotionScores,
  ToolCallMessage as ToolCall,
  ToolResponseMessage as ToolResponse,
  ToolErrorMessage as ToolError,
  ChatMetadata as ChatMetadataMessage,
} from 'hume/api/resources/empathicVoice';

export { LanguageModelOption } from './types';
export { type SocketConfig } from './lib/embed-messages';
