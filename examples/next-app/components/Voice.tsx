'use client';
import { ExampleComponent } from '@/components/ExampleComponent';
import { VoiceProvider } from '@humeai/voice-react';

export const Voice = ({ accessToken }: { accessToken: string }) => {
  return (
    <VoiceProvider
      auth={{ type: 'accessToken', value: accessToken }}
      hostname={process.env.HUME_VOICE_HOSTNAME || 'api.hume.ai'}
      onMessage={(message) => {
        console.log('got message', message);
      }}
    >
      <ExampleComponent />
    </VoiceProvider>
  );
};
