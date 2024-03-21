'use client';
import { VoiceProvider } from '@humeai/voice-react';

import { ExampleComponent } from '@/components/ExampleComponent';

export const Voice = ({ accessToken }: { accessToken: string }) => {
  return (
    <VoiceProvider
      auth={{ type: 'accessToken', value: accessToken }}
      hostname={process.env.HUME_VOICE_HOSTNAME || 'api.hume.ai'}
      onMessage={(message) => {
        // eslint-disable-next-line no-console
        console.log('message', message);
      }}
    >
      <ExampleComponent />
    </VoiceProvider>
  );
};
