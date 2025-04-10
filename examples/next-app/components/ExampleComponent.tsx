'use client';

import { useVoice } from '@humeai/voice-react';
import { SelectItem } from '@radix-ui/react-select';
import { useCallback, useState } from 'react';
import { match } from 'ts-pattern';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from '@/components/Select';
import { Waveform } from '@/components/Waveform';

export const ExampleComponent = () => {
  const {
    connect,
    disconnect,
    fft: audioFft,
    status,
    isMuted,
    isAudioMuted,
    isPlaying,
    mute,
    muteAudio,
    readyState,
    unmute,
    unmuteAudio,
    messages,
    micFft,
    callDurationTimestamp,
    sendUserInput,
    sendAssistantInput,
    pauseAssistant,
    resumeAssistant,
    chatMetadata,
    playerQueueLength,
    lastUserMessage,
    lastVoiceMessage,
    isPaused,
  } = useVoice();

  const [textValue, setTextValue] = useState('');
  const [textInputType, setTextInputType] = useState<'user' | 'assistant'>(
    'user',
  );

  const togglePaused = useCallback(() => {
    if (isPaused) {
      resumeAssistant();
    } else {
      pauseAssistant();
    }
  }, [isPaused, resumeAssistant, pauseAssistant]);
  const pausedText = isPaused ? 'Resume' : 'Pause';

  return (
    <div>
      <div className={'flex flex-col gap-4 font-light'}>
        <div className="flex flex-col gap-4">
          {match(status.value)
            .with('connected', () => (
              <>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-700 bg-neutral-800 p-4">
                  <div className="col-span-2 flex items-center justify-between border-b border-neutral-700 pb-2">
                    <div className="text-sm font-medium text-neutral-300">
                      Call Duration
                    </div>
                    <div className="text-sm text-neutral-100">
                      {callDurationTimestamp ?? 'n/a'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-300">
                      Playing
                    </div>
                    <div className="text-sm text-neutral-100">
                      {isPlaying ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-300">
                      Queue Length
                    </div>
                    <div className="text-sm text-neutral-100">
                      {playerQueueLength}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-300">
                      Ready State
                    </div>
                    <div className="text-sm text-neutral-100">{readyState}</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-300">
                      Request ID
                    </div>
                    <div className="text-sm text-neutral-100">
                      {chatMetadata?.requestId || '-'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-300">
                      Chat Group ID
                    </div>
                    <div className="text-sm text-neutral-100">
                      {chatMetadata?.chatGroupId || '-'}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-start">
                    <button
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                      onClick={() => {
                        disconnect();
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={'rounded-lg border border-neutral-700'}>
                    <div className="p-2">User</div>
                    <div className="flex flex-col items-center gap-2">
                      <Waveform fft={micFft} />
                    </div>
                    <div className={'p-2'}>
                      <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                        onClick={() => (isMuted ? unmute() : mute())}
                      >
                        {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                      </button>
                    </div>
                    <div className="border-t border-neutral-700 p-2">
                      <div className={'text-sm font-medium'}>
                        Last user message
                      </div>
                      <div>
                        Received at:{' '}
                        {lastUserMessage?.receivedAt.toTimeString() ?? 'n/a'}
                      </div>
                      <textarea
                        className={
                          'w-full bg-neutral-800 font-mono text-sm text-white'
                        }
                        value={JSON.stringify(lastUserMessage)}
                        readOnly
                      ></textarea>
                    </div>
                  </div>
                  <div className={'rounded-lg border border-neutral-700'}>
                    <div className="p-2">Assistant</div>
                    <div className="flex flex-col items-center gap-2">
                      <Waveform fft={audioFft} />
                    </div>
                    <div className={'p-2'}>
                      <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                        onClick={() =>
                          isAudioMuted ? unmuteAudio() : muteAudio()
                        }
                      >
                        {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                      </button>
                    </div>
                    <div className="border-t border-neutral-700 p-2">
                      <div className={'text-sm font-medium'}>
                        Last assistant message
                      </div>
                      <div>
                        Received at:{' '}
                        {lastVoiceMessage?.receivedAt.toTimeString() ?? 'n/a'}
                      </div>

                      <textarea
                        className={
                          'w-full bg-neutral-800 font-mono text-sm text-white'
                        }
                        value={JSON.stringify(lastVoiceMessage)}
                        readOnly
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-start gap-2">
                  <div className="text-sm font-medium text-neutral-300">
                    Send a text input message
                  </div>
                  <div className="flex gap-2">
                    <SelectGroup className="shrink-0">
                      <Select
                        value={textInputType}
                        onValueChange={(value) => {
                          if (value === 'user' || value === 'assistant') {
                            setTextInputType(value);
                          }
                        }}
                      >
                        <SelectTrigger className="border-neutral-600 bg-neutral-700 text-neutral-100">
                          <SelectValue placeholder="Select message input type" />
                          {textInputType === 'user' ? 'User' : 'Assistant'}
                        </SelectTrigger>
                        <SelectContent className="border-neutral-600 bg-neutral-700">
                          <SelectItem
                            value="user"
                            className="text-neutral-100 hover:bg-neutral-600"
                          >
                            User
                          </SelectItem>
                          <SelectItem
                            value="assistant"
                            className="text-neutral-100 hover:bg-neutral-600"
                          >
                            Assistant
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </SelectGroup>
                    <label className="flex grow flex-col gap-2">
                      <span className="sr-only">Text input content</span>
                      <input
                        className="rounded-lg border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Write an input message here"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                      />
                    </label>
                  </div>

                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                    onClick={() => {
                      const method =
                        textInputType === 'user'
                          ? sendUserInput
                          : sendAssistantInput;
                      method(textValue);
                    }}
                  >
                    Send Message
                  </button>

                  <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                    onClick={togglePaused}
                  >
                    {pausedText}
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
              </>
            ))
            .with('disconnected', () => (
              <>
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
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
                <div className={'py-6'}>Connecting...</div>
              </>
            ))
            .with('error', () => (
              <div className="flex flex-col gap-4">
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
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
