import { type FrameToClientAction } from '@humeai/assistant-react';

export const parentDispatch = (action: FrameToClientAction) => {
  console.log('sending message', action);
  window.parent.postMessage(action, '*');
};
