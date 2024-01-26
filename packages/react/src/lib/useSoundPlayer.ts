import { arrayBufferToBlob } from '@humeai/assistant';
import type { MeydaFeaturesObject } from 'meyda';
import Meyda from 'meyda';
import { useCallback, useEffect, useRef, useState } from 'react';

function generateEmptyFft(): number[] {
  return Array.from({ length: 24 }).map(() => 0);
}

export const useSoundPlayer = ({
  onError,
}: {
  onError: (message: string) => void;
}) => {
  const [queue, setQueue] = useState<{
    isProcessing: boolean;
    clips: Array<HTMLAudioElement>;
  }>({
    isProcessing: false,
    clips: [],
  });
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const currentClip = useRef<HTMLAudioElement | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const isInitialized = useRef(false);

  const initPlayer = () => {
    audioContext.current = new AudioContext();
    isInitialized.current = true;
  };

  const addToQueue = useCallback(
    (clip: ArrayBuffer) => {
      if (!isInitialized.current) {
        onError('AudioContext has not been initialized');
        return;
      }
      try {
        // defining MIME type on the blob is required for the audio
        // player to work in safari
        const blob = arrayBufferToBlob(clip, 'audio/mp3');
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.autoplay = false;
        audio.load();

        setQueue((prev) => ({
          isProcessing: prev.isProcessing,
          clips: [...prev.clips, audio],
        }));
      } catch (e) {
        void true;
      }
    },
    [onError],
  );

  const playClip = useCallback(
    async (audioElement: HTMLAudioElement) => {
      if (!audioContext.current) {
        onError('AudioContext has not been initialized');
        return;
      }

      const source =
        audioContext.current.createMediaElementSource(audioElement);
      source.connect(audioContext.current.destination);

      let analyzer: ReturnType<typeof Meyda.createMeydaAnalyzer>;

      try {
        analyzer = Meyda.createMeydaAnalyzer({
          audioContext: audioContext.current,
          source,
          featureExtractors: ['loudness'],
          callback: (features: MeydaFeaturesObject) => {
            const newFft = features.loudness.specific || [];
            setFft(() => Array.from(newFft));
          },
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        onError(`Failed to start audio analyzer: ${message}`);
        return;
      }

      return new Promise<void>((resolve, reject) => {
        audioElement.addEventListener('ended', () => {
          audioElement.remove();
          analyzer.stop();
          resolve();
        });

        audioElement.addEventListener('error', (e) => {
          analyzer.stop();
          const message = e instanceof Error ? e.message : 'Unknown error';
          onError(`Error in audio player: ${message}`);
          reject();
        });

        analyzer.start();
        void audioElement.play();
      });
    },
    [onError],
  );

  useEffect(() => {
    if (!audioContext.current) {
      return;
    }
    if (queue.clips.length === 0) {
      setFft(generateEmptyFft());
      return;
    }
    if (queue.isProcessing) {
      setFft(generateEmptyFft());
      return;
    }

    currentClip.current = queue.clips[0] ?? null;

    setQueue((prev) => ({
      isProcessing: true,
      clips: prev.clips.slice(1),
    }));

    if (currentClip.current) {
      void Promise.resolve(playClip(currentClip.current)).finally(() => {
        setQueue((prev) => ({
          isProcessing: false,
          clips: prev.clips,
        }));
      });
    }
  }, [queue, playClip]);

  const stopAll = useCallback(() => {
    if (currentClip.current) {
      currentClip.current.pause();
      currentClip.current.remove();
    }

    setQueue(() => ({
      isProcessing: false,
      clips: [],
    }));
  }, []);

  return {
    addToQueue,
    fft,
    initPlayer,
    isPlaying: queue.isProcessing,
    stopAll,
  };
};
