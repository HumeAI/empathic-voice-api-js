import { arrayBufferToBlob } from '@humeai/assistant';
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

  const addToQueue = useCallback((clip: ArrayBuffer) => {
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
  }, []);

  const playClip = async (audioElement: HTMLAudioElement) => {
    return new Promise<void>((resolve, reject) => {
      audioElement.addEventListener('ended', () => {
        audioElement.remove();
        resolve();
      });

      audioElement.addEventListener('error', () => {
        reject();
      });

      void audioElement.play();
    });
  };

  useEffect(() => {
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
  }, [queue]);

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
  };
};
