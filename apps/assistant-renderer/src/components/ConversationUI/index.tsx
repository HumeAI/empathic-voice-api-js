import { useAssistant } from '@humeai/assistant-react';

export const ConversationUI = () => {
  const { readyState } = useAssistant({
    apiKey: '<API KEY>',
  });

  return <div className={'font-medium'}>[connection: {readyState}]</div>;
};
