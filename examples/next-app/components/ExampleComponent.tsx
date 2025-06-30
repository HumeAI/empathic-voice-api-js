'use client';

import { useVoice } from '@humeai/voice-react';
import { match } from 'ts-pattern';

import { ChatConnected } from '@/components/ChatConnected';

export const ExampleComponent = ({ accessToken }: { accessToken: string }) => {
  const { connect, disconnect, status, callDurationTimestamp } = useVoice();

  const connectArgs = {
    auth: {
      type: 'accessToken' as const,
      value: accessToken,
    },
    hostname: process.env.NEXT_PUBLIC_HUME_VOICE_HOSTNAME || 'api.hume.ai',
    configId: process.env.NEXT_PUBLIC_HUME_VOICE_WEATHER_CONFIG_ID,
    sessionSettings: {
      type: 'session_settings' as const,
      builtinTools: [{ name: 'web_search' as const }],
    },
  };

  const connectButton = (
    <button
      className="max-w-sm rounded border border-neutral-500 p-2"
      onClick={() => {
        void connect(connectArgs);
      }}
    >
      Connect to voice
    </button>
  );

  const callDuration = (
    <div>
      <div className={'text-sm font-medium uppercase'}>Call duration</div>
      <div>{callDurationTimestamp ?? 'n/a'}</div>
    </div>
  );

  return (
    <div>
      <div className={'flex flex-col gap-4 font-light'}>
        <div>
          <div className={'text-sm font-medium uppercase'}>Status</div>
          <div>{status.value}</div>
        </div>
        <div className="flex flex-col gap-4">
          {match(status.value)
            .with('connected', () => <ChatConnected />)
            .with('disconnected', () => (
              <>
                {callDuration}
                {connectButton}
              </>
            ))
            .with('connecting', () => (
              <div className="flex max-w-sm flex-col gap-4">
                {callDuration}

                <button
                  className="cursor-not-allowed rounded border border-neutral-500 p-2"
                  disabled
                >
                  Connecting...
                </button>
                <button
                  className="rounded border border-red-500 p-2 text-red-500"
                  onClick={() => {
                    void disconnect();
                  }}
                >
                  Disconnect
                </button>
              </div>
            ))
            .with('error', () => (
              <div className="flex max-w-sm flex-col gap-4">
                {callDuration}
                {connectButton}
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
