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
  const config = createConfig(props);

  const onError = useCallback((message: string) => {
    setStatus({ value: 'error', reason: message });
  }, []);

  const player = useSoundPlayer({
    onError,
  });

  const {
    encodingRef,
    streamRef,
    getStream,
    permission: storedPermission,
  } = useEncoding({
    encodingConstraints: {
      sampleRate: config.sampleRate,
      channelCount: config.channels,
    },
    onPermissionChange: (permission) => {
      if (permission === 'denied') {
        setStatus({ value: 'error', reason: 'Microphone permission denied' });
      }
      if (permission === 'granted') {
        setStatus({ value: 'disconnected' });
      }
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
    const permission = await getStream();
    if (permission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'connecting' });
      client.connect({
        ...config,
        sampleRate: encodingRef.current.sampleRate,
        channels: encodingRef.current.channelCount,
      });
      void mic.start();
      player.initPlayer();
      setStatus({ value: 'connected' });
    }
  };

  const disconnect = useCallback(() => {
    if (storedPermission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'disconnected' });
    }
    client.disconnect();
    player.stopAll();
    mic.stop();
  }, [client, player, mic, storedPermission]);

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
