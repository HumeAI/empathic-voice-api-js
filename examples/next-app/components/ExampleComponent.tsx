'use client';

import { Waveform } from '@/components/Waveform';
import type { EmotionScores } from '@humeai/voice';
import { useVoice } from '@humeai/voice-react';
import { useEffect, useMemo, useRef } from 'react';
import { match } from 'ts-pattern';

function getTop3Expressions(expressionOutputs: EmotionScores) {
  return Object.entries(expressionOutputs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, value]) => ({ name: key, score: value }));
}

export const ExampleComponent = () => {
  const {
    connect,
    disconnect,
    fft: audioFft,
    status,
    isMuted,
    isPlaying,
    mute,
    readyState,
    unmute,
    messages,
    micFft,
    sendText,
    callDurationTimestamp,
  } = useVoice();

  const initialMessageSent = useRef(false);

  useEffect(() => {
    if (!initialMessageSent.current && status.value === 'connected') {
      initialMessageSent.current = true;
      sendText(
        'Please greet me as though I were a long lost friend from your childhood',
      );
    }
    return () => {
      initialMessageSent.current = false;
    };
  }, [status.value, sendText]);

  const assistantMessages = useMemo(() => {
    return messages
      .map((message) => {
        if (message.type === 'assistant_message') {
          return {
            message: message.message,
            top3: getTop3Expressions(message.models.prosody?.scores ?? {}),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [messages]);

  const callDuration = (
    <div>
      <div className={'font-medium uppercase text-sm'}>Call duration</div>
      <div>{callDurationTimestamp ?? 'n/a'}</div>
    </div>
  );

  return (
    <div>
      <div className={'flex flex-col font-light gap-4'}>
        <div className="flex max-w-sm flex-col gap-4">
          {match(status.value)
            .with('connected', () => (
              <>
                <div className="flex gap-6">
                  {callDuration}
                  <div>
                    <div className={'font-medium uppercase text-sm'}>
                      Playing
                    </div>
                    <div>{isPlaying ? 'true' : 'false'}</div>
                  </div>
                  <div>
                    <div className={'font-medium uppercase text-sm'}>
                      Ready state
                    </div>
                    <div>{readyState}</div>
                  </div>
                </div>

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

                <div className="flex gap-10">
                  <Waveform fft={audioFft} />
                  <Waveform fft={micFft} />
                </div>

                <div>
                  <div className={'font-medium uppercase text-sm'}>
                    All messages ({messages.length})
                  </div>
                  <textarea
                    className={
                      'w-full bg-neutral-800 font-mono text-white text-sm'
                    }
                    value={JSON.stringify(messages, null, 0)}
                    readOnly
                  ></textarea>
                </div>

                <div>
                  <div className={'font-medium uppercase text-sm'}>
                    Last assistant message
                  </div>
                  {assistantMessages.length > 0 ? (
                    <div className="bg-neutral-800 font-mono text-white text-sm">
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
              <>
                {callDuration}

                <button
                  className="rounded border border-neutral-500 p-2"
                  onClick={() => {
                    void connect();
                  }}
                >
                  Connect to voice
                </button>
              </>
            ))
            .with('connecting', () => (
              <>
                {callDuration}
                <button
                  className="cursor-not-allowed rounded border border-neutral-500 p-2"
                  disabled
                >
                  Connecting...
                </button>
              </>
            ))
            .with('error', () => (
              <div className="flex flex-col gap-4">
                {callDuration}

                <button
                  className="rounded border border-neutral-500 p-2"
                  onClick={() => {
                    void connect();
                  }}
                >
                  Connect to voice
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
