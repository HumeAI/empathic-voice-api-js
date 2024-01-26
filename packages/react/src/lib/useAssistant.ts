import { createConfig } from '@humeai/assistant';
import { useCallback, useEffect, useState } from 'react';

import { useAssistantClient } from './useAssistantClient';
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
  const [micPermission, setMicPermission] = useState<
    'prompt' | 'granted' | 'denied'
  >('prompt');

  const config = createConfig(props);

  const onError = useCallback((message: string) => {
    setStatus({ value: 'error', reason: message });
  }, []);

  const player = useSoundPlayer({
    onError,
  });

  const client = useAssistantClient({
    config,
    onAudioMessage: (arrayBuffer) => {
      player.addToQueue(arrayBuffer);
    },
    onError,
  });

  const onMicPermissionChange = useCallback(
    (permission: 'prompt' | 'granted' | 'denied') => {
      setMicPermission(permission);

      if (permission === 'granted') {
        setStatus({ value: 'connected' });
        client.connect();
        player.initPlayer();
      }

      if (permission === 'denied') {
        setStatus({ value: 'error', reason: 'Microphone permission denied' });
        client.disconnect();
        player.stopAll();
      }
    },
    [client, player],
  );

  const mic = useMicrophone({
    numChannels: config.channels,
    sampleRate: config.sampleRate,
    onAudioCaptured: (arrayBuffer) => {
      client.sendAudio(arrayBuffer);
    },
    onMicPermissionChange,
    onError,
  });

  const connect = useCallback(() => {
    if (micPermission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'connecting' });
      void mic.start();
    }
  }, [micPermission, mic]);

  const disconnect = useCallback(() => {
    if (status.value !== 'error') {
      // if the status is `error`, keep the existing status
      setStatus({ value: 'disconnected' });
    }
    client.disconnect();
    player.stopAll();
    mic.stop();
  }, [client, player, mic, status.value]);

  useEffect(() => {
    if (status.value === 'error') {
      // If the status is ever set to `error`, disconnect the assistant.
      disconnect();
    }
  }, [status, disconnect]);

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
