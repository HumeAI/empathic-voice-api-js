import { convertBase64ToBlob } from 'hume';
import { useCallback, useRef, useState } from 'react';

import { convertLinearFrequenciesToBark } from './convertFrequencyScale';
import { generateEmptyFft } from './generateEmptyFft';
import type { AudioOutputMessage } from '../models/messages';

export const useSoundPlayer = (props: {
  onError: (message: string) => void;
  onPlayAudio: (id: string) => void;
  onStopAudio: (id: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const audioContext = useRef<AudioContext | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const isInitialized = useRef(false);

  const clipQueue = useRef<
    Array<{
      id: string;
      buffer: AudioBuffer;
    }>
  >([]);
  const [queueLength, setQueueLength] = useState(0);

  const isProcessing = useRef(false);
  const currentlyPlayingAudioBuffer = useRef<AudioBufferSourceNode | null>(
    null,
  );
  const frequencyDataIntervalId = useRef<number | null>(null);

  const onPlayAudio = useRef<typeof props.onPlayAudio>(props.onPlayAudio);
  onPlayAudio.current = props.onPlayAudio;

  const onStopAudio = useRef<typeof props.onStopAudio>(props.onStopAudio);
  onStopAudio.current = props.onStopAudio;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const playNextClip = useCallback(() => {
    if (analyserNode.current === null || audioContext.current === null) {
      onError.current('Audio environment is not initialized');
      return;
    }

    if (clipQueue.current.length === 0 || isProcessing.current) {
      setQueueLength(0);
      return;
    }

    const nextClip = clipQueue.current.shift();
    setQueueLength(clipQueue.current.length);

    if (!nextClip) return;

    isProcessing.current = true;
    setIsPlaying(true);

    // Use AudioBufferSourceNode for audio playback.
    // Safari suffered a truncation issue using HTML5 audio playback
    const bufferSource = audioContext.current.createBufferSource();

    bufferSource.buffer = nextClip.buffer;

    bufferSource.connect(analyserNode.current);

    currentlyPlayingAudioBuffer.current = bufferSource;

    const updateFrequencyData = () => {
      try {
        const bufferSampleRate = bufferSource.buffer?.sampleRate;

        if (!analyserNode.current || typeof bufferSampleRate === 'undefined')
          return;

        const dataArray = new Uint8Array(
          analyserNode.current.frequencyBinCount,
        ); // frequencyBinCount is 1/2 of fftSize
        analyserNode.current.getByteFrequencyData(dataArray); // Using getByteFrequencyData for performance

        const barkFrequencies = convertLinearFrequenciesToBark(
          dataArray,
          bufferSampleRate,
        );
        setFft(() => barkFrequencies);
      } catch (e) {
        setFft(generateEmptyFft());
      }
    };

    frequencyDataIntervalId.current = window.setInterval(
      updateFrequencyData,
      5,
    );

    bufferSource.start(0);
    onPlayAudio.current(nextClip.id);

    bufferSource.onended = () => {
      if (frequencyDataIntervalId.current) {
        clearInterval(frequencyDataIntervalId.current);
      }
      setFft(generateEmptyFft());
      bufferSource.disconnect();
      isProcessing.current = false;
      setIsPlaying(false);
      onStopAudio.current(nextClip.id);
      currentlyPlayingAudioBuffer.current = null;
      playNextClip();
    };
  }, []);

  const initPlayer = useCallback(() => {
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

    isInitialized.current = true;
  }, []);

  const addToQueue = useCallback(
    async (message: AudioOutputMessage) => {
      if (!isInitialized.current || !audioContext.current) {
        onError.current('Audio player has not been initialized');
        return;
      }

      try {
        const blob = convertBase64ToBlob(message.data, 'audio/mp3');
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer =
          await audioContext.current.decodeAudioData(arrayBuffer);

        clipQueue.current.push({
          id: message.id,
          buffer: audioBuffer,
        });
        setQueueLength(clipQueue.current.length);

        // playNextClip will iterate the clipQueue upon finishing the playback of the current audio clip, so we can
        // just call playNextClip here if it's the only one in the queue
        if (clipQueue.current.length === 1) {
          playNextClip();
        }
      } catch (e) {
        const eMessage = e instanceof Error ? e.message : 'Unknown error';
        onError.current(`Failed to add clip to queue: ${eMessage}`);
      }
    },
    [playNextClip],
  );

  const stopAll = useCallback(() => {
    isInitialized.current = false;
    isProcessing.current = false;
    setIsPlaying(false);
    setIsAudioMuted(false);
    setVolumeState(1.0);

    if (frequencyDataIntervalId.current) {
      window.clearInterval(frequencyDataIntervalId.current);
    }

    if (currentlyPlayingAudioBuffer.current) {
      currentlyPlayingAudioBuffer.current.disconnect();
      currentlyPlayingAudioBuffer.current = null;
    }

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

    clipQueue.current = [];
    setQueueLength(0);
    setFft(generateEmptyFft());
  }, []);

  const clearQueue = useCallback(() => {
    if (currentlyPlayingAudioBuffer.current) {
      currentlyPlayingAudioBuffer.current.stop();
      currentlyPlayingAudioBuffer.current = null;
    }

    clipQueue.current = [];
    setQueueLength(0);
    isProcessing.current = false;
    setIsPlaying(false);
    setFft(generateEmptyFft());
  }, []);

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
    queueLength,
    volume,
    setVolume,
  };
};
