import { createConfig } from '@humeai/assistant';

import { useAssistantClient } from './useAssistantClient';
import { useMicrophone } from './useMicrophone';
import { useSoundPlayer } from './useSoundPlayer';
import { useCallback, useEffect } from 'react';

export const useAssistant = (props: Parameters<typeof createConfig>[0]) => {
  const config = createConfig(props);

  const player = useSoundPlayer();

  const client = useAssistantClient({
    config,
    onAudioMessage: (arrayBuffer) => {
      // player.addToQueue(arrayBuffer);
    },
  });

  const mp3Url =
    'https://storage.googleapis.com/playground-sample-files/media/Toxicity/toxicity_nontoxic_001.mp3';
  const mp3Url2 =
    'https://storage.googleapis.com/playground-sample-files/media/Mood/mood_nondepressed_004.mp4';

  const mic = useMicrophone({
    numChannels: config.channels,
    sampleRate: config.sampleRate,
    onAudioCaptured: (arrayBuffer) => {
      client.sendAudio(arrayBuffer);
    },
  });

  const initialize = useCallback(() => {
    player.initPlayer();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      console.log('requesting media');
      void fetch(mp3Url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          // Now 'arrayBuffer' contains the MP3 data as an ArrayBuffer
          player.addToQueue(arrayBuffer);
          // return fetch(mp3Url2);
        });
      // .then((response) => response.arrayBuffer())
      // .then((arrayBuffer) => {
      //   player.addToQueue(arrayBuffer);
      // });
    }, 3000);
  }, []);

  return {
    isPlaying: player.isPlaying,
    messages: client.messages,
    readyState: client.readyState,
    isMuted: mic.isMuted,
    mute: mic.mute,
    unmute: mic.unmute,
    initialize,
    fft: player.fft,
  };
};
