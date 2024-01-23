import { createConfig } from '@humeai/assistant';
import { useCallback, useEffect, useState } from 'react';
import { usePermission } from 'react-use';

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
  const hasMicPermission = usePermission({ name: 'microphone' });

  const config = createConfig(props);

  const player = useSoundPlayer();

  const client = useAssistantClient({
    config,
    onAudioMessage: (arrayBuffer) => {
      player.addToQueue(arrayBuffer);
    },
  });

  const mic = useMicrophone({
    numChannels: config.channels,
    sampleRate: config.sampleRate,
    onAudioCaptured: (arrayBuffer) => {
      client.sendAudio(arrayBuffer);
    },
  });

  const connect = useCallback(() => {
    if (hasMicPermission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'connecting' });
      void mic.start();
    }
  }, [hasMicPermission]);

  const disconnect = useCallback(() => {
    if (hasMicPermission === 'denied') {
      setStatus({ value: 'error', reason: 'Microphone permission denied' });
    } else {
      setStatus({ value: 'disconnected' });
    }
    client.disconnect();
    player.stopAll();
    mic.stop();
  }, [hasMicPermission]);

  useEffect(() => {
    if (hasMicPermission === 'granted' && status.value === 'connecting') {
      setStatus({ value: 'connected' });
      client.connect();
      player.initPlayer();
    }
  }, [hasMicPermission, status]);

  useEffect(() => {
    if (hasMicPermission === 'denied') {
      disconnect();
    }
  }, [hasMicPermission]);

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
