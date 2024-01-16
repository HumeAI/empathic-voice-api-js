'use client';

import { useAssistant } from '@humeai/assistant-react';

export const ExampleComponent = ({ apiKey }: { apiKey: string }) => {
  const { isPlaying, readyState, mute, unmute, isMuted } = useAssistant({
    apiKey,
    hostname: 'api.hume.ai',
  });

  return (
    <div>
      <div className={'font-light'}>
        <div>Playing: {isPlaying ? 'true' : 'false'}</div>
        <div>Ready State: {readyState}</div>

        <div className="flex gap-4">
          {isMuted ? (
            <button onClick={() => unmute()}>Unmute</button>
          ) : (
            <button onClick={() => mute()}>Mute</button>
          )}
        </div>
      </div>
    </div>
  );
};
