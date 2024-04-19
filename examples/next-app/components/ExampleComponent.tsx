'use client';

import type { EmotionScores } from '@humeai/voice';
import { useVoice } from '@humeai/voice-react';
import { useMemo, useState } from 'react';
import { P, match } from 'ts-pattern';

import { Waveform } from '@/components/Waveform';
import { Select, SelectGroup } from '@/components/Select';
import { Label, SelectItem } from '@radix-ui/react-select';

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
    callDurationTimestamp,
  } = useVoice();

  const [textValue, setTextValue] = useState('');
  const [textInputType, setTextInputType] = useState<'user' | 'assistant'>(
    'user',
  );

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
      <div className={'text-sm font-medium uppercase'}>Call duration</div>
      <div>{callDurationTimestamp ?? 'n/a'}</div>
    </div>
  );

  return (
    <div>
      <div className={'flex flex-col gap-4 font-light'}>
        <div className="flex max-w-sm flex-col gap-4">
          {match(status.value)
            .with('connected', () => (
              <>
                <div className="flex gap-6">
                  {callDuration}
                  <div>
                    <div className={'text-sm font-medium uppercase'}>
                      Playing
                    </div>
                    <div>{isPlaying ? 'true' : 'false'}</div>
                  </div>
                  <div>
                    <div className={'text-sm font-medium uppercase'}>
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

                <div className="flex flex-col gap-2 justify-start">
                  <div className="uppercase text-sm font-medium">
                    Send a message
                  </div>
                  <SelectGroup>
                    <Label>Source</Label>
                    <Select
                      value={textInputType}
                      onValueChange={(value) => {
                        if (value === 'user' || value === 'assistant') {
                          setTextInputType(value);
                        }
                      }}
                    >
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </Select>
                  </SelectGroup>

                  <label className="flex flex-col gap-2">
                    <span>Content</span>
                    <input
                      className="border border-black px-2 py-1"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                    />
                  </label>

                  <button
                    className="border border-black"
                    onClick={() => {
                      console.log('sending message', textValue, textInputType);
                    }}
                  >
                    Send message
                  </button>
                </div>

                <div>
                  <div className={'text-sm font-medium uppercase'}>
                    All messages ({messages.length})
                  </div>
                  <textarea
                    className={
                      'w-full bg-neutral-800 font-mono text-sm text-white'
                    }
                    value={JSON.stringify(messages, null, 0)}
                    readOnly
                  ></textarea>
                </div>

                <div>
                  <div className={'text-sm font-medium uppercase'}>
                    Last assistant message
                  </div>
                  {assistantMessages.length > 0 ? (
                    <div className="bg-neutral-800 font-mono text-sm text-white">
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
