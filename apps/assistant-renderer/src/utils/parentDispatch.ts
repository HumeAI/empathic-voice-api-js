import { type FrameToClientAction } from '@humeai/voice-react';

export const parentDispatch = (action: FrameToClientAction) => {
  console.log('[parent dispatch] sending message', action);
  window.parent.postMessage(action, '*');
};
