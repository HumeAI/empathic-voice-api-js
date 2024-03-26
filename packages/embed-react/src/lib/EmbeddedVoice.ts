import {
  type CloseHandler,
  EmbeddedVoice as EA,
  type EmbeddedVoiceConfig,
  type TranscriptMessageHandler,
} from '@humeai/voice-embed';
import { useEffect, useRef } from 'react';

type EmbeddedVoiceProps = Partial<EmbeddedVoiceConfig> &
  NonNullable<Pick<EmbeddedVoiceConfig, 'auth'>> & {
    onMessage?: TranscriptMessageHandler;
    onClose?: CloseHandler;
    isEmbedOpen: boolean;
    openOnMount?: boolean;
  };

export const EmbeddedVoice = (props: EmbeddedVoiceProps) => {
  const {
    onMessage,
    isEmbedOpen,
    onClose,
    openOnMount = false,
    ...config
  } = props;
  const embeddedVoice = useRef<EA | null>(null);
  const onMessageHandler = useRef<TranscriptMessageHandler | undefined>();
  onMessageHandler.current = onMessage;

  const onCloseHandler = useRef<CloseHandler | undefined>();
  onCloseHandler.current = onClose;

  const stableConfig = useRef<
    Partial<EmbeddedVoiceConfig> &
      NonNullable<Pick<EmbeddedVoiceConfig, 'auth'>>
  >();
  stableConfig.current = config;

  useEffect(() => {
    let unmount: () => void;
    if (!embeddedVoice.current && stableConfig.current) {
      embeddedVoice.current = EA.create({
        onMessage: onMessageHandler.current,
        onClose: onCloseHandler.current,
        openOnMount: openOnMount,
        ...stableConfig.current,
      });
      unmount = embeddedVoice.current.mount();
    }

    return () => {
      unmount?.();
      embeddedVoice.current = null;
    };
  }, [openOnMount]);

  useEffect(() => {
    if (isEmbedOpen) {
      embeddedVoice.current?.openEmbed();
    }
  }, [isEmbedOpen]);

  return null;
};
