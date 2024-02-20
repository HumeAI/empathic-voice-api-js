import { EmbeddedVoice as EA } from '@humeai/voice';
import { useEffect, useRef } from 'react';

export const EmbeddedVoice = (config: Parameters<typeof EA.create>[0]) => {
  const embeddedVoice = useRef<EA | null>(null);

  useEffect(() => {
    embeddedVoice.current = EA.create(config);
    const unmount = embeddedVoice.current.mount();

    return () => {
      unmount();
      embeddedVoice.current = null;
    };
  }, [config]);

  return null;
};
