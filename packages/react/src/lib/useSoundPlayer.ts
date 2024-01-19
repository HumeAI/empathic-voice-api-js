import { arrayBufferToBlob } from '@humeai/assistant';
import Meyda, { MeydaFeaturesObject } from 'meyda';
import { MeydaAnalyzer } from 'meyda';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useSoundPlayer = () => {
  const [queue, setQueue] = useState<{
    isProcessing: boolean;
    clips: Array<HTMLAudioElement>;
  }>({
    isProcessing: false,
    clips: [],
  });

  const currentClip = useRef<HTMLAudioElement | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const meydaAnalyzer = useRef<MeydaAnalyzer>(null);

  const [fft, setFft] = useState<number[]>([]);

  // const [isInitialized, setIsInitialized] = useState(false);
  const isInitialized = useRef(false);

  const initPlayer = () => {
    audioContext.current = new AudioContext();
    isInitialized.current = true;
  };

  const addToQueue = useCallback(
    (clip: ArrayBuffer) => {
      if (!isInitialized.current) {
        throw new Error('Context has not been initialized');
      }
      try {
        const blob = arrayBufferToBlob(clip);
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
    [isInitialized],
  );

  const playClip = async (audioElement: HTMLAudioElement) => {
    if (audioContext.current) {
      const source =
        audioContext.current.createMediaElementSource(audioElement);
      source.connect(audioContext.current.destination);

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext.current,
        source,
        bufferSize: 512,
        featureExtractors: ['loudness'],
        callback: (features: MeydaFeaturesObject) => {
          const newFft = features.loudness.specific || [];
          setFft(() => Array.from(newFft));
        },
      });
      meydaAnalyzer.current = analyzer;
      // }

      return new Promise<void>((resolve, reject) => {
        audioElement.addEventListener('ended', () => {
          audioElement.remove();
          if (meydaAnalyzer.current) {
            meydaAnalyzer.current.stop();
          }
          resolve();
        });

        audioElement.addEventListener('error', () => {
          meydaAnalyzer.current?.stop();
          reject();
        });

        console.log('playing', meydaAnalyzer.current);

        meydaAnalyzer.current?.start();
        void audioElement.play();
      });
    }
  };

  useEffect(() => {
    if (!audioContext.current) {
      return;
    }
    if (queue.clips.length === 0) {
      return;
    }
    if (queue.isProcessing) {
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
  }, [queue, isInitialized]);

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
    isPlaying: queue.isProcessing,
    addToQueue,
    stopAll,
    fft,
    initPlayer,
  };
};
