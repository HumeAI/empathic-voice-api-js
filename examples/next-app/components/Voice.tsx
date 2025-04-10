'use client';
import { VoiceProvider } from '@humeai/voice-react';
import { useState } from 'react';

import { DeviceSelector } from '@/components/DeviceSelector';
import { ExampleComponent } from '@/components/ExampleComponent';
import { useWeatherToolHandler } from '@/components/WeatherToolHandler';

export const Voice = ({ accessToken }: { accessToken: string }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const weatherToolHandler = useWeatherToolHandler();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-neutral-100">
          Audio Settings
        </h2>
        <DeviceSelector
          onDeviceChange={setSelectedDevice}
          onSpeakerChange={setSelectedSpeaker}
        />
      </div>

      <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-neutral-100">
          Voice Assistant
        </h2>
        <VoiceProvider
          auth={{ type: 'accessToken', value: accessToken }}
          hostname={
            process.env.NEXT_PUBLIC_HUME_VOICE_HOSTNAME || 'api.hume.ai'
          }
          messageHistoryLimit={10}
          microphoneDeviceId={selectedDevice}
          speakerDeviceId={selectedSpeaker}
          onMessage={(message) => {
            // eslint-disable-next-line no-console
            console.log('message', message);
          }}
          onAudioStart={(clipId) => {
            // eslint-disable-next-line no-console
            console.log('Start playing clip with ID:', clipId);
          }}
          onAudioEnd={(clipId) => {
            // eslint-disable-next-line no-console
            console.log('Stop playing clip with ID:', clipId);
          }}
          onInterruption={(message) => {
            // eslint-disable-next-line no-console
            console.log(
              'Interruption triggered on the following message',
              message,
            );
          }}
          onToolCall={weatherToolHandler}
          configId={process.env.NEXT_PUBLIC_HUME_VOICE_WEATHER_CONFIG_ID}
          onClose={(event) => {
            const niceClosure = 1000;
            const code = event.code;

            if (code !== niceClosure) {
              // eslint-disable-next-line no-console
              console.error('close event was not nice', event);
            }
          }}
          sessionSettings={{
            type: 'session_settings',
            builtinTools: [{ name: 'web_search' }],
          }}
        >
          <ExampleComponent />
        </VoiceProvider>
      </div>
    </div>
  );
};
