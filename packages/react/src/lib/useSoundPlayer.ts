import { type AudioOutputMessage, base64ToBlob } from '@humeai/voice';
import type { MeydaFeaturesObject } from 'meyda';
import Meyda from 'meyda';
import { useCallback, useRef, useState } from 'react';

import { generateEmptyFft } from './generateEmptyFft';

export const useSoundPlayer = (props: {
  onError: (message: string) => void;
  onPlayAudio: (id: string) => void;
}) => {
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const audioContext = useRef<AudioContext | null>(null);
  const isInitialized = useRef(false);

  const audioElement = useRef<HTMLAudioElement | null>(null);
  const currentAnalyzer = useRef<ReturnType<
    typeof Meyda.createMeydaAnalyzer
  > | null>(null);

  const clipQueue = useRef<
    Array<{
      id: string;
      clip: string;
    }>
  >([]);
  const isProcessing = useRef(false);

  const onPlayAudio = useRef<typeof props.onPlayAudio>(props.onPlayAudio);
  onPlayAudio.current = props.onPlayAudio;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const handleAudioEnded = useCallback(() => {
    isProcessing.current = false;

    if (clipQueue.current.length === 0) {
      currentAnalyzer.current?.stop();
      return;
    }
    setFft(generateEmptyFft());
    clipQueue.current.shift();
    const nextClip = clipQueue.current[0];
    if (nextClip && audioElement.current) {
      isProcessing.current = true;
      audioElement.current.src = nextClip.clip;
      onPlayAudio.current(nextClip.id);
    }
  }, []);

  const handleAudioError = useCallback((e: unknown) => {
    isProcessing.current = false;

    currentAnalyzer.current?.stop();
    currentAnalyzer.current = null;

    const message = e instanceof Error ? e.message : 'Unknown error';
    onError.current(`Error in audio player: ${message}`);
  }, []);

  const initPlayer = useCallback(() => {
    audioContext.current = new AudioContext();
    isInitialized.current = true;

    // audio element must be initialized on user gesture, or the audio won't play in Safari
    audioElement.current = new Audio();
    audioElement.current.autoplay = true;

    audioElement.current.addEventListener('ended', handleAudioEnded);
    audioElement.current.addEventListener('error', handleAudioError);

    const source = audioContext.current.createMediaElementSource(
      audioElement.current,
    );
    source.connect(audioContext.current.destination);

    try {
      currentAnalyzer.current = Meyda.createMeydaAnalyzer({
        audioContext: audioContext.current,
        source,
        featureExtractors: ['loudness'],
        callback: (features: MeydaFeaturesObject) => {
          const newFft = features.loudness.specific || [];
          setFft(() => Array.from(newFft));
        },
      });
    } catch (e: unknown) {
      currentAnalyzer.current = null;
      const message = e instanceof Error ? e.message : 'Unknown error';
      onError.current(`Failed to start audio analyzer: ${message}`);
      return;
    }
  }, [handleAudioEnded, handleAudioError]);

  const addToQueue = useCallback((message: AudioOutputMessage) => {
    if (!isInitialized.current) {
      onError.current('Audio player has not been initialized');
      return;
    }
    try {
      // defining MIME type on the blob is required for the audio
      // player to work in safari
      const blob = base64ToBlob(message.data, 'audio/mp3');
      const url = URL.createObjectURL(blob);

      // add clip to queue
      clipQueue.current.push({
        id: message.id,
        clip: url,
      });

      // if it's the only clip in the queue, start playing it
      if (clipQueue.current.length === 1 && audioElement.current) {
        isProcessing.current = true;
        onPlayAudio.current(message.id);
        audioElement.current.src = url;
        currentAnalyzer.current?.start();
      }
    } catch (e) {
      void true;
    }
  }, []);

  const stopAll = useCallback(() => {
    isInitialized.current = false;
    isProcessing.current = false;

    if (audioContext.current) {
      if (audioContext.current.state !== 'closed') {
        void audioContext.current.close();
      }
      audioContext.current = null;
    }

    audioElement.current?.pause();
    audioElement.current?.removeEventListener('ended', handleAudioEnded);
    audioElement.current?.removeEventListener('error', handleAudioError);
    audioElement.current?.remove();

    if (currentAnalyzer.current) {
      currentAnalyzer.current.stop();
      currentAnalyzer.current = null;
    }

    clipQueue.current = [];
    isProcessing.current = false;

    setFft(generateEmptyFft());
  }, [handleAudioEnded, handleAudioError]);

  return {
    addToQueue,
    fft,
    initPlayer,
    isPlaying: isProcessing.current,
    stopAll,
  };
};
