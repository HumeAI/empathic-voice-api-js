import {
  EmbeddedVoice as EA,
  type TranscriptMessageHandler,
} from '@humeai/voice-embed';
import { useEffect, useRef } from 'react';

type EmbeddedVoiceProps = Parameters<typeof EA.create>[0] & {
  onMessage?: TranscriptMessageHandler;
};
export const EmbeddedVoice = (props: EmbeddedVoiceProps) => {
  const { onMessage, ...config } = props;
  const embeddedVoice = useRef<EA | null>(null);
  const onMessageHandler = useRef<TranscriptMessageHandler | undefined>();
  onMessageHandler.current = onMessage;

  useEffect(() => {
    embeddedVoice.current = EA.create({
      onMessage: onMessageHandler.current,
      ...config,
    });
    const unmount = embeddedVoice.current.mount();

    return () => {
      unmount();
      embeddedVoice.current = null;
    };
  }, [config]);

  return null;
};
