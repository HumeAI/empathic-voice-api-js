import {
  EmbeddedVoice as EA,
  TranscriptMessageHandler,
} from '@humeai/voice-embed';
import { useEffect, useRef } from 'react';

type EmbeddedVoiceProps = Parameters<typeof EA.create>[0] & {
  onMessage?: TranscriptMessageHandler;
};
export const EmbeddedVoice = (props: EmbeddedVoiceProps) => {
  const { onMessage, ...config } = props;
  const embeddedVoice = useRef<EA | null>(null);

  useEffect(() => {
    embeddedVoice.current = EA.create({ onMessage, ...config });
    const unmount = embeddedVoice.current.mount();

    return () => {
      unmount();
      embeddedVoice.current = null;
    };
  }, [config]);

  return null;
};
