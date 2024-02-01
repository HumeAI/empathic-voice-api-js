import { createConfig } from '@humeai/assistant';
import { useCallback, useEffect, useState } from 'react';

import { useAssistantClient } from './useAssistantClient';
import { useEncoding } from './useEncoding';
import { useMicrophone } from './useMicrophone';
import { useSoundPlayer } from './useSoundPlayer';

type AssistantStatus =
  | {
      value: 'disconnected' | 'connecting' | 'connected';
      reason?: never;
    }
  | {
      value: 'error';
      reason: string;
    };

export const useAssistant = (props: Parameters<typeof createConfig>[0]) => {
  const [status, setStatus] = useState<AssistantStatus>({
    value: 'disconnected',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const config = createConfig(props);

  const onError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  const player = useSoundPlayer({
    onError,
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
    onError,
  });

  const mic = useMicrophone({
    streamRef,
    onAudioCaptured: (arrayBuffer) => {
      client.sendAudio(arrayBuffer);
    },
    onError,
  });

  const connect = async () => {
    setErrorMessage('');
    setStatus({ value: 'connecting' });
    const permission = await getStream();

    if (permission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
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
          setStatus({
            value: 'error',
            reason: 'Could not connect to assistant. Please try again.',
          });
        });
    }
  };

  const disconnect = useCallback(() => {
    if (micPermission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    }

    client.disconnect();
    player.stopAll();
    mic.stop();
    if (status.value !== 'error') {
      // if status was 'error', keep the error status so we can show the error message to the end user.
      // otherwise, set status to 'disconnected'
      setStatus({ value: 'disconnected' });
    }
  }, [client, player, mic, micPermission, status.value]);

  useEffect(() => {
    if (
      errorMessage &&
      status.value !== 'error' &&
      status.value !== 'disconnected'
    ) {
      // If the status is ever set to `error`, disconnect the assistant.
      setStatus({ value: 'error', reason: errorMessage });
      disconnect();
    }
  }, [errorMessage, status.value, disconnect]);

  return {
    connect,
    disconnect,
    fft: player.fft,
    isMuted: mic.isMuted,
    isPlaying: player.isPlaying,
    messages: client.messages,
    mute: mic.mute,
    readyState: client.readyState,
    status,
    unmute: mic.unmute,
  };
};
