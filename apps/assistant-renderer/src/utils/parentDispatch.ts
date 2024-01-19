import { PostMessageAction } from '@humeai/assistant-react';

export const parentDispatch = (action: PostMessageAction) => {
  console.log('sending message', action);
  window.parent.postMessage(action, '*');
};
