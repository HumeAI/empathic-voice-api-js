import { type FrameToClientAction } from '@humeai/voice-embed-react';

export const parentDispatch = (action: FrameToClientAction) => {
  console.log('[parent dispatch] sending message', action);
  window.parent.postMessage(action, '*');
};
