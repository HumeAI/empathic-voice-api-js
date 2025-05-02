import { convertBase64ToBlob } from 'hume';
import { useCallback, useEffect, useRef, useState } from 'react';

import { convertLinearFrequenciesToBark } from './convertFrequencyScale';
import { generateEmptyFft } from './generateEmptyFft';
import type { AudioOutputMessage } from '../models/messages';

const FADE_DURATION = 0.1;
const FADE_TARGET = 0.0001;

export const useSoundPlayer = (props: {
  onError: (message: string) => void;
  onPlayAudio: (id: string) => void;
  onStopAudio: (id: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const isFadeCancelled = useRef(false);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const audioContext = useRef<AudioContext | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const workletNode = useRef<AudioWorkletNode | null>(null);
  const isInitialized = useRef(false);

  const isProcessing = useRef(false);
  const frequencyDataIntervalId = useRef<number | null>(null);

  const onPlayAudio = useRef<typeof props.onPlayAudio>(props.onPlayAudio);
  onPlayAudio.current = props.onPlayAudio;

  const onStopAudio = useRef<typeof props.onStopAudio>(props.onStopAudio);
  onStopAudio.current = props.onStopAudio;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const initPlayer = useCallback(async () => {
    try {
      const initAudioContext = new AudioContext();
      audioContext.current = initAudioContext;

      // Use AnalyserNode to get fft frequency data for visualizations
      const analyser = initAudioContext.createAnalyser();
      // Use GainNode to adjust volume
      const gain = initAudioContext.createGain();

      analyser.fftSize = 2048; // Must be a power of 2
      analyser.connect(gain);
      gain.connect(initAudioContext.destination);

      analyserNode.current = analyser;
      gainNode.current = gain;

      await initAudioContext.audioWorklet
        .addModule(
          'https://storage.googleapis.com/evi-react-sdk-assets/audio-worklet.js',
        )
        .catch((e) => {
          console.log(e);
        });

      const worklet = new AudioWorkletNode(initAudioContext, 'audio-processor');
      worklet.connect(analyser);
      workletNode.current = worklet;

      worklet.port.onmessage = (e: MessageEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (e.data?.type === 'ended') {
          setIsPlaying(false);
          onStopAudio.current('stream');
        }
      };

      frequencyDataIntervalId.current = window.setInterval(() => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount); // frequencyBinCount is 1/2 of fftSize
        analyser.getByteFrequencyData(dataArray); // Using getByteFrequencyData for performance

        const barkFrequencies = convertLinearFrequenciesToBark(
          dataArray,
          initAudioContext.sampleRate,
        );
        setFft(() => barkFrequencies);
      }, 5);

      isInitialized.current = true;
    } catch (e) {
      onError.current('Failed to initialize audio player');
    }
  }, []);

  const addToQueue = useCallback(
    async (message: AudioOutputMessage) => {
      if (!isInitialized.current || !audioContext.current) {
        onError.current('Audio player has not been initialized');
        return;
      }

      try {
        const blob = convertBase64ToBlob(message.data);
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer =
          await audioContext.current.decodeAudioData(arrayBuffer);

        const pcmData = audioBuffer.getChannelData(0);

        if (gainNode.current) {
          const now = audioContext.current.currentTime;
          gainNode.current.gain.cancelScheduledValues(now);
          const targetGain = isAudioMuted ? 0 : volume;
          gainNode.current.gain.setValueAtTime(targetGain, now);
        }

        workletNode.current?.port.postMessage({ type: 'audio', data: pcmData });

        setIsPlaying(true);
        onPlayAudio.current(message.id);
      } catch (e) {
        const eMessage = e instanceof Error ? e.message : 'Unknown error';
        onError.current(`Failed to add clip to queue: ${eMessage}`);
      }
    },
    [isAudioMuted, volume],
  );

  const waitForAudioTime = (
    targetTime: number,
    ctx: AudioContext,
    isCancelled: () => boolean,
  ): Promise<void> =>
    new Promise((resolve) => {
      const check = () => {
        if (isCancelled()) return;

        if (ctx.currentTime >= targetTime) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });

  const fadeOutAndPostMessage = useCallback((type: 'end' | 'clear') => {
    if (!gainNode.current || !audioContext.current) {
      workletNode.current?.port.postMessage({ type });
      return;
    }

    const now = audioContext.current.currentTime;

    gainNode.current.gain.cancelScheduledValues(now);
    gainNode.current.gain.setValueAtTime(gainNode.current.gain.value, now);
    gainNode.current.gain.exponentialRampToValueAtTime(
      FADE_TARGET,
      now + FADE_DURATION,
    );

    isFadeCancelled.current = false;
    //await waitForAudioTime(
    //  now + FADE_DURATION,
    //  audioContext.current,
    //  () => isFadeCancelled.current,
    //);

    workletNode.current?.port.postMessage({ type });

    gainNode.current?.gain.setValueAtTime(
      1.0,
      audioContext.current?.currentTime || 0,
    );
  }, []);

  useEffect(() => {
    return () => {
      isFadeCancelled.current = true;
    };
  }, []);

  const stopAll = useCallback(() => {
    isInitialized.current = false;
    isProcessing.current = false;
    setIsPlaying(false);
    setIsAudioMuted(false);
    setVolumeState(1.0);

    if (frequencyDataIntervalId.current) {
      window.clearInterval(frequencyDataIntervalId.current);
    }

    fadeOutAndPostMessage('end');

    if (analyserNode.current) {
      analyserNode.current.disconnect();
      analyserNode.current = null;
    }

    if (audioContext.current) {
      void audioContext.current
        .close()
        .then(() => {
          audioContext.current = null;
        })
        .catch(() => {
          // .close() rejects if the audio context is already closed.
          // Therefore, we just need to catch the error, but we don't need to
          // do anything with it.
          return null;
        });
    }

    if (workletNode.current) {
      workletNode.current.port.close();
      workletNode.current.disconnect();
      workletNode.current = null;
    }

    setFft(generateEmptyFft());
  }, [fadeOutAndPostMessage]);

  const clearQueue = useCallback(() => {
    fadeOutAndPostMessage('clear');
    isProcessing.current = false;
    setIsPlaying(false);
    setFft(generateEmptyFft());
  }, [fadeOutAndPostMessage]);

  const setVolume = useCallback(
    (newLevel: number) => {
      const clampedLevel = Math.max(0, Math.min(newLevel, 1.0));
      setVolumeState(clampedLevel);
      if (gainNode.current && audioContext.current && !isAudioMuted) {
        gainNode.current.gain.setValueAtTime(
          clampedLevel,
          audioContext.current.currentTime,
        );
      }
    },
    [isAudioMuted],
  );

  const muteAudio = useCallback(() => {
    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime);
      setIsAudioMuted(true);
    }
  }, []);

  const unmuteAudio = useCallback(() => {
    if (gainNode.current && audioContext.current) {
      gainNode.current.gain.setValueAtTime(
        volume,
        audioContext.current.currentTime,
      );
      setIsAudioMuted(false);
    }
  }, [volume]);

  return {
    addToQueue,
    fft,
    initPlayer,
    isPlaying,
    isAudioMuted,
    muteAudio,
    unmuteAudio,
    stopAll,
    clearQueue,
    volume,
    setVolume,
  };
};
