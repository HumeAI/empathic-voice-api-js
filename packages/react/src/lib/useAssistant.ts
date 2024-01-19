import { createConfig } from '@humeai/assistant';
import { useCallback } from 'react';

import { useAssistantClient } from './useAssistantClient';
import { useMicrophone } from './useMicrophone';
import { useSoundPlayer } from './useSoundPlayer';

export const useAssistant = (props: Parameters<typeof createConfig>[0]) => {
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

  const initialize = useCallback(() => {
    client.initClient();
    player.initPlayer();
  }, []);

  return {
    isPlaying: player.isPlaying,
    messages: client.messages,
    readyState: client.readyState,
    isMuted: mic.isMuted,
    fft: player.fft,
    initialize,
    mute: mic.mute,
    unmute: mic.unmute,
  };
};
