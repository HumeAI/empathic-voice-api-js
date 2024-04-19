'use client';
import { VoiceProvider } from '@humeai/voice-react';

import { ExampleComponent } from '@/components/ExampleComponent';

export const Voice = ({ accessToken }: { accessToken: string }) => {
  return (
    <VoiceProvider
      auth={{ type: 'accessToken', value: accessToken }}
      hostname={process.env.NEXT_PUBLIC_HUME_VOICE_HOSTNAME || 'api.hume.ai'}
      messageHistoryLimit={10}
      onMessage={(message) => {
        // eslint-disable-next-line no-console
        console.log('message', message);
      }}
      onClose={(event) => {
        const niceClosure = 1000;
        const code = event.code;

        if (code !== niceClosure) {
          // eslint-disable-next-line no-console
          console.error('close event was not nice', event);
        }
      }}
    >
      <ExampleComponent />
    </VoiceProvider>
  );
};
