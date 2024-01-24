'use client';

import { useAssistant } from '@humeai/assistant-react';
import { useMemo } from 'react';
import { match } from 'ts-pattern';

function getTop3Expressions(
  expressionOutputs: { name: string; score: number }[],
) {
  return [...expressionOutputs].sort((a, b) => b.score - a.score).slice(0, 3);
}

export const ExampleComponent = () => {
  const {
    connect,
    disconnect,
    fft,
    status,
    isMuted,
    isPlaying,
    mute,
    readyState,
    unmute,
    messages,
    micFft: _micFft,
  } = useAssistant();

  const normalizedFft = useMemo(() => {
    const max = 2.5;
    const min = Math.min(...fft);

    // define a minimum possible value because we want the bar to have
    // a height even when the audio is off
    const minNormalizedValue = 0.01;
    return Array.from(fft).map((x) => {
      // normalize & avoid divide by zero
      const normalized = max === min ? max : (x - min) / (max - min);
      const lowerBounded = Math.max(minNormalizedValue, normalized);
      const upperBounded = Math.min(1, lowerBounded);
      return Math.round(upperBounded * 100);
    });
  }, [fft]);

  const assistantMessages = useMemo(() => {
    return messages
      .map((message) => {
        if (message.type === 'assistant_message') {
          return {
            message: message.message,
            top3: getTop3Expressions(message.models[0].entries),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [messages]);

  const assistantFftAnimation = (
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
  );

  return (
    <div>
      <div className={'font-light'}>
        <div className="flex max-w-sm flex-col gap-4">
          {match(status.value)
            .with('connected', () => (
              <>
                <div className="flex gap-2">
                  <button
                    className="rounded border border-neutral-500 p-2"
                    onClick={() => {
                      disconnect();
                    }}
                  >
                    Disconnect
                  </button>

                  {isMuted ? (
                    <button
                      className="rounded border border-neutral-500 p-2"
                      onClick={() => unmute()}
                    >
                      Unmute mic
                    </button>
                  ) : (
                    <button
                      className="rounded border border-neutral-500 p-2"
                      onClick={() => mute()}
                    >
                      Mute mic
                    </button>
                  )}
                </div>

                {assistantFftAnimation}

                <div>Playing: {isPlaying ? 'true' : 'false'}</div>
                <div>Ready State: {readyState}</div>

                <div>
                  <div className={'font-medium'}>
                    Last transcript message received from assistant:
                  </div>
                  {assistantMessages.length > 0 ? (
                    <div>
                      {JSON.stringify(
                        assistantMessages[assistantMessages.length - 1],
                        null,
                        2,
                      )}
                    </div>
                  ) : (
                    <div>No transcript available</div>
                  )}
                </div>
              </>
            ))
            .with('disconnected', () => (
              <button
                className="rounded border border-neutral-500 p-2"
                onClick={() => {
                  void connect();
                }}
              >
                Connect to assistant
              </button>
            ))
            .with('connecting', () => (
              <button
                className="cursor-not-allowed rounded border border-neutral-500 p-2"
                disabled
              >
                Connecting...
              </button>
            ))
            .with('error', () => (
              <div className="flex flex-col gap-4">
                <button
                  className="rounded border border-neutral-500 p-2"
                  onClick={() => {
                    void connect();
                  }}
                >
                  Connect to assistant
                </button>

                <div>
                  <span className="text-red-500">{status.reason}</span>
                </div>
              </div>
            ))
            .exhaustive()}
        </div>
      </div>
    </div>
  );
};
