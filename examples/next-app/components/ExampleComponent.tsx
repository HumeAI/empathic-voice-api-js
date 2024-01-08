'use client';

import { useAssistant } from '@humeai/assistant-react';

export const ExampleComponent = ({ apiKey }: { apiKey: string }) => {
  const { isPlaying, readyState } = useAssistant({
    apiKey,
    hostname: 'api.hume.ai',
  });

  return (
    <div>
      <div className={'font-light'}>
        <div>Playing: {isPlaying ? 'true' : 'false'}</div>
        <div>Ready State: {readyState}</div>
      </div>
    </div>
  );
};
