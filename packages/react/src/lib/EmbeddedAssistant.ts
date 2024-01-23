import { EmbeddedAssistant as EA } from '@humeai/assistant';
import { useEffect, useRef } from 'react';

export const EmbeddedAssistant = (config: Parameters<typeof EA.create>[0]) => {
  const embeddedAssistant = useRef<EA | null>(null);

  useEffect(() => {
    embeddedAssistant.current = EA.create(config);
    const unmount = embeddedAssistant.current.mount();

    return () => {
      unmount();
      embeddedAssistant.current = null;
    };
  }, [config]);

  return null;
};
