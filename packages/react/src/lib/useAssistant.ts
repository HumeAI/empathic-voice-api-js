import { createConfig } from '@humeai/assistant';
import { useCallback, useEffect, useState } from 'react';

import { useAssistantClient } from './useAssistantClient';
import { useSoundPlayer } from './useSoundPlayer';
import { useEncoding, useMicrophone } from './useMicrophone';

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

  const { permission, encodingRef, streamRef, getStream } = useEncoding({
    encodingConstraints: {
      sampleRate: config.sampleRate,
      channelCount: config.channels,
    },
  });

  const client = useAssistantClient({
    config: {
      ...config,
      sampleRate: encodingRef.current.sampleRate,
      channels: encodingRef.current.channelCount,
    },
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

  useEffect(() => {
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
  }, [permission]);

  const connect = async () => {
    await getStream();
    if (permission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'connecting' });
      void mic.start();
    }
  };

  const disconnect = useCallback(() => {
    if (permission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'disconnected' });
    }
    client.disconnect();
    player.stopAll();
    mic.stop();
  }, [client, player, mic, permission]);

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
