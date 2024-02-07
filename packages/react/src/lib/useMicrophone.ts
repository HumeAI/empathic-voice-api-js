// cspell:ignore dataavailable

import type { IBlobEvent, IMediaRecorder } from 'extendable-media-recorder';
import {
  MediaRecorder as ExtendableMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import Meyda from 'meyda';
import type { MeydaFeaturesObject } from 'meyda';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { generateEmptyFft } from './generateEmptyFft';

export type MicrophoneProps = {
  streamRef: MutableRefObject<MediaStream | null>;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError: (message: string) => void;
};

export const useMicrophone = (props: MicrophoneProps) => {
  const { streamRef, onAudioCaptured, onError } = props;
  const isMutedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [fft, setFft] = useState<number[]>(generateEmptyFft());
  const currentAnalyzer = useRef<Meyda.MeydaAnalyzer | null>(null);

  const mimeType = 'audio/wav';
  const recorder = useRef<IMediaRecorder | null>(null);

  const encoderPortRef = useRef<MessagePort | null>(null);

  const sendAudio = useRef(onAudioCaptured);
  sendAudio.current = onAudioCaptured;

  const dataHandler = useCallback((event: IBlobEvent) => {
    const blob = event.data;

    if (isMutedRef.current) {
      return;
    }

    blob
      .arrayBuffer()
      .then((buffer) => {
        sendAudio.current?.(buffer);
      })
      .catch(() => {});
  }, []);

  const start = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) {
      throw new Error('No stream connected');
    }

    const context = new AudioContext();
    const input = context.createMediaStreamSource(stream);

    try {
      currentAnalyzer.current = Meyda.createMeydaAnalyzer({
        audioContext: context,
        source: input,
        featureExtractors: ['loudness'],
        callback: (features: MeydaFeaturesObject) => {
          const newFft = features.loudness.specific || [];
          setFft(() => Array.from(newFft));
        },
      });

      currentAnalyzer.current.start();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error(`Failed to start mic analyzer: ${message}`);
    }

    if (!encoderPortRef.current) {
      const port = await connect();
      encoderPortRef.current = port;
      await register(port);
    }

    recorder.current = new ExtendableMediaRecorder(stream, {
      mimeType,
    });
    recorder.current.addEventListener('dataavailable', dataHandler);
    recorder.current.start(250);
  }, [dataHandler, streamRef]);

  const stop = useCallback(() => {
    try {
      if (currentAnalyzer.current) {
        currentAnalyzer.current.stop();
        currentAnalyzer.current = null;
      }

      recorder.current?.stop();
      recorder.current?.removeEventListener('dataavailable', dataHandler);
      recorder.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      onError(`Error stopping microphone: ${message}`);
      console.log(e);
      void true;
    }
  }, [dataHandler, onError, streamRef]);

  const mute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.stop();
      setFft(generateEmptyFft());
    }

    isMutedRef.current = true;
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.start();
    }
    isMutedRef.current = false;
    setIsMuted(false);
  }, []);

  useEffect(() => {
    return () => {
      try {
        recorder.current?.stop();
        recorder.current?.removeEventListener('dataavailable', dataHandler);

        if (currentAnalyzer.current) {
          currentAnalyzer.current.stop();
          currentAnalyzer.current = null;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      } catch (e) {
        console.log(e);
        void true;
      }
    };
  }, [dataHandler, streamRef]);

  return {
    start,
    stop,
    mute,
    unmute,
    isMuted,
    fft,
  };
};
