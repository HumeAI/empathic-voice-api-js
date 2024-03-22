import { useCallback, useRef, useState } from 'react';
import { type AudioOutputMessage, base64ToBlob } from '@humeai/voice';
import { generateEmptyFft } from './generateEmptyFft';

export const useSoundPlayer = (props: {
  onError: (message: string) => void;
  onPlayAudio: (id: string) => void;
}) => {
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const audioContext = useRef<AudioContext | null>(null);
  const isInitialized = useRef(false);

  const clipQueue = useRef<
    Array<{
      id: string;
      buffer: AudioBuffer;
    }>
  >([]);
  const isProcessing = useRef(false);
  const currentlyPlayingAudioBuffer = useRef<AudioBufferSourceNode | null>(
    null,
  );

  const onPlayAudio = useRef<typeof props.onPlayAudio>(props.onPlayAudio);
  onPlayAudio.current = props.onPlayAudio;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const playNextClip = useCallback(() => {
    if (clipQueue.current.length === 0 || isProcessing.current) {
      return;
    }

    const nextClip = clipQueue.current.shift();
    if (!nextClip) return;

    isProcessing.current = true;
    const source = audioContext.current!.createBufferSource();
    currentlyPlayingAudioBuffer.current = source;
    source.buffer = nextClip.buffer;
    source.connect(audioContext.current!.destination);
    source.start(0);
    console.log('Starting source');
    onPlayAudio.current(nextClip.id);

    source.onended = () => {
      isProcessing.current = false;
      currentlyPlayingAudioBuffer.current = null;
      playNextClip();
    };
  }, []);

  const initPlayer = useCallback(() => {
    audioContext.current = new window.AudioContext();
    isInitialized.current = true;
  }, []);

  const addToQueue = useCallback(
    async (message: AudioOutputMessage) => {
      if (!isInitialized.current || !audioContext.current) {
        onError.current('Audio player has not been initialized');
        return;
      }

      try {
        const blob = base64ToBlob(message.data, 'audio/mp3');
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer =
          await audioContext.current.decodeAudioData(arrayBuffer);

        clipQueue.current.push({
          id: message.id,
          buffer: audioBuffer,
        });

        if (clipQueue.current.length > 0) {
          playNextClip();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        onError.current(`Failed to add clip to queue: ${message}`);
      }
    },
    [playNextClip],
  );

  const stopAll = useCallback(() => {
    isInitialized.current = false;
    isProcessing.current = false;

    if (audioContext.current) {
      audioContext.current.close().then(() => {
        audioContext.current = null;
      });
    }

    clipQueue.current = [];
    setFft(generateEmptyFft());
  }, []);

  const clearQueue = useCallback(() => {
    if (currentlyPlayingAudioBuffer.current) {
      currentlyPlayingAudioBuffer.current.stop();
    }
    clipQueue.current = [];
    isProcessing.current = false;
    setFft(generateEmptyFft());
  }, []);

  return {
    addToQueue,
    fft,
    initPlayer,
    isPlaying: isProcessing.current,
    stopAll,
    clearQueue,
  };
};
