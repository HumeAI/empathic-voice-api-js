import { createConfig, TranscriptMessage } from '@humeai/assistant';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type AssistantReadyState,
  useAssistantClient,
} from './useAssistantClient';
import { useEncoding } from './useEncoding';
import { useMicrophone } from './useMicrophone';
import { useSoundPlayer } from './useSoundPlayer';

type AssistantError =
  | { type: 'socket_error'; message: string }
  | { type: 'audio_error'; message: string }
  | { type: 'mic_error'; message: string };

type AssistantStatus =
  | {
      value: 'disconnected' | 'connecting' | 'connected';
      reason?: never;
    }
  | {
      value: 'error';
      reason: string;
    };

export type AssistantContextType = {
  connect: () => Promise<void>;
  disconnect: () => void;
  fft: number[];
  isMuted: boolean;
  isPlaying: boolean;
  messages: TranscriptMessage[];
  lastAssistantMessage: TranscriptMessage | null;
  lastUserMessage: TranscriptMessage | null;
  mute: () => void;
  unmute: () => void;
  readyState: AssistantReadyState;
  status: AssistantStatus;
  micFft: number[];
  error: AssistantError | null;
  isAudioError: boolean;
  isError: boolean;
  isMicrophoneError: boolean;
  isSocketError: boolean;
};

const AssistantContext = createContext<AssistantContextType | null>(null);

export type AssistantProviderProps = PropsWithChildren<
  Parameters<typeof createConfig>[0]
> & {
  onMessage?: (message: TranscriptMessage) => void;
  onError?: (err: AssistantError) => void;
};

export const useAssistant = () => {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return ctx;
};

export const AssistantProvider: FC<AssistantProviderProps> = ({
  children,
  onMessage,
  ...props
}) => {
  const [status, setStatus] = useState<AssistantStatus>({
    value: 'disconnected',
  });

  // error handling
  const [error, setError] = useState<AssistantError | null>(null);
  const isError = error !== null;
  const isMicrophoneError = error?.type === 'mic_error';
  const isSocketError = error?.type === 'socket_error';
  const isAudioError = error?.type === 'audio_error';
  const onError = useRef(props.onError);
  onError.current = props.onError;

  const updateError = useCallback((err: AssistantError | null) => {
    setError(err);
    if (err !== null) {
      onError.current?.(err);
    }
  }, []);

  const config = createConfig(props);

  const player = useSoundPlayer({
    onError: (message) => {
      updateError({ type: 'audio_error', message });
    },
  });

  const {
    encodingRef,
    streamRef,
    getStream,
    permission: micPermission,
  } = useEncoding({
    encodingConstraints: {
      sampleRate: config.sampleRate,
      channelCount: config.channels,
    },
  });

  const client = useAssistantClient({
    onAudioMessage: (arrayBuffer) => {
      player.addToQueue(arrayBuffer);
    },
    onTranscriptMessage: onMessage,
    onError: (message) => {
      updateError({ type: 'socket_error', message });
    },
  });

  const mic = useMicrophone({
    streamRef,
    onAudioCaptured: (arrayBuffer) => {
      client.sendAudio(arrayBuffer);
    },
    onError: (message) => {
      updateError({ type: 'mic_error', message });
    },
  });

  const connect = useCallback(async () => {
    updateError(null);
    setStatus({ value: 'connecting' });
    const permission = await getStream();

    if (permission === 'denied') {
      updateError({
        type: 'mic_error',
        message: 'Microphone permission denied',
      });
    } else {
      return client
        .connect({
          ...config,
          sampleRate: encodingRef.current.sampleRate,
          channels: encodingRef.current.channelCount,
        })
        .then(() => {
          return mic.start();
        })
        .then(() => {
          player.initPlayer();
          setStatus({ value: 'connected' });
        })
        .catch(() => {
          updateError({
            type: 'socket_error',
            message: 'We could not connect to the assistant. Please try again.',
          });
        });
    }
  }, [client, config, encodingRef, getStream, mic, player, updateError]);

  const disconnectFromAssistant = useCallback(() => {
    client.disconnect();
    player.stopAll();
    mic.stop();
  }, [client, player, mic]);

  const disconnect = useCallback(
    (disconnectOnError?: boolean) => {
      if (micPermission === 'denied') {
        setStatus({ value: 'error', reason: 'Microphone permission denied' });
      }

      disconnectFromAssistant();

      if (status.value !== 'error' && !disconnectOnError) {
        // if status was 'error', keep the error status so we can show the error message to the end user.
        // otherwise, set status to 'disconnected'
        setStatus({ value: 'disconnected' });
      }
    },
    [micPermission, status.value, disconnectFromAssistant],
  );

  useEffect(() => {
    if (
      error !== null &&
      status.value !== 'error' &&
      status.value !== 'disconnected'
    ) {
      // If the status is ever set to `error`, disconnect the assistant.
      setStatus({ value: 'error', reason: error.message });
      disconnectFromAssistant();
    }
  }, [status.value, disconnect, disconnectFromAssistant, error]);

  const ctx = useMemo(
    () =>
      ({
        connect,
        disconnect,
        fft: player.fft,
        micFft: mic.fft,
        isMuted: mic.isMuted,
        isPlaying: player.isPlaying,
        messages: client.messages,
        lastAssistantMessage: client.lastAssistantMessage,
        lastUserMessage: client.lastUserMessage,
        mute: mic.mute,
        readyState: client.readyState,
        status,
        unmute: mic.unmute,
        error,
        isAudioError,
        isError,
        isMicrophoneError,
        isSocketError,
      }) satisfies AssistantContextType,
    [
      connect,
      disconnect,
      player.fft,
      player.isPlaying,
      mic.fft,
      mic.isMuted,
      mic.mute,
      mic.unmute,
      client.messages,
      client.lastAssistantMessage,
      client.lastUserMessage,
      client.readyState,
      status,
      error,
      isAudioError,
      isError,
      isMicrophoneError,
      isSocketError,
    ],
  );

  return (
    <AssistantContext.Provider value={ctx}>
      {children}
    </AssistantContext.Provider>
  );
};
