import { arrayBufferToBlob } from '@humeai/assistant';
import type { MeydaFeaturesObject } from 'meyda';
import Meyda from 'meyda';
import { useCallback, useRef, useState } from 'react';

function generateEmptyFft(): number[] {
  return Array.from({ length: 24 }).map(() => 0);
}

export const useSoundPlayer = ({
  onError,
}: {
  onError: (message: string) => void;
}) => {
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const audioContext = useRef<AudioContext | null>(null);
  const isInitialized = useRef(false);

  const audioElement = useRef<HTMLAudioElement | null>(null);
  const currentAnalyzer = useRef<ReturnType<
    typeof Meyda.createMeydaAnalyzer
  > | null>(null);

  const clipQueue = useRef<Array<string>>([]);
  const isProcessing = useRef(false);

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
      audioElement.current.src = nextClip;
    }
  }, []);

  const handleAudioError = useCallback(
    (e: unknown) => {
      isProcessing.current = false;

      currentAnalyzer.current?.stop();
      currentAnalyzer.current = null;

      const message = e instanceof Error ? e.message : 'Unknown error';
      onError(`Error in audio player: ${message}`);
    },
    [onError],
  );

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
      onError(`Failed to start audio analyzer: ${message}`);
      return;
    }
  }, [handleAudioEnded, handleAudioError, onError]);

  const addToQueue = useCallback(
    (clip: ArrayBuffer) => {
      if (!isInitialized.current) {
        onError('Audio player has not been initialized');
        return;
      }
      try {
        // defining MIME type on the blob is required for the audio
        // player to work in safari
        const blob = arrayBufferToBlob(clip, 'audio/mp3');
        const url = URL.createObjectURL(blob);

        // add clip to queue
        clipQueue.current.push(url);

        // if it's the only clip in the queue, start playing it
        if (clipQueue.current.length === 1 && audioElement.current) {
          isProcessing.current = true;
          audioElement.current.src = url;
          currentAnalyzer.current?.start();
        }
      } catch (e) {
        void true;
      }
    },
    [onError],
  );

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
