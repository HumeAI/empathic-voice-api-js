'use client';

import { useAssistant } from '@humeai/assistant-react';
import { useMemo } from 'react';

export const ExampleComponent = ({ apiKey }: { apiKey: string }) => {
  const { isPlaying, readyState, mute, unmute, isMuted, fft, initialize } =
    useAssistant({
      apiKey,
      hostname: 'api.hume.ai',
    });

  const normalizedFft = useMemo(() => {
    const max = Math.max(...fft);
    const min = Math.min(...fft);

    // define a minimum possible value because we want the bar to have
    // a height even when the audio is off
    const minNormalizedValue = 0.15;
    return Array.from(fft).map((x) => {
      if (max === min) {
        return minNormalizedValue;
      }
      const normalized = Math.max(minNormalizedValue, (x - min) / (max - min));
      return Math.round(normalized * 100);
    });
  }, [fft]);

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
        <button
          onClick={() => {
            initialize();
          }}
        >
          Init player
        </button>
        <div className="grid h-32 grid-cols-1 grid-rows-2 p-4">
          <div className="flex items-end gap-1">
            {normalizedFft.map((val, i) => {
              return (
                <div
                  key={`fft-top-${i}`}
                  style={{ height: `${val}%` }}
                  className={
                    'w-2 rounded-full bg-neutral-500 transition-all duration-75'
                  }
                ></div>
              );
            })}
          </div>
          <div className="flex items-start gap-1">
            {normalizedFft.map((val, i) => {
              return (
                <div
                  key={`fft-bottom-${i}`}
                  style={{ height: `${val}%` }}
                  className={
                    'w-2 rounded-full bg-neutral-500 transition-all duration-75'
                  }
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
