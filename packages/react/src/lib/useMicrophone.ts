// cspell:ignore dataavailable
import type { MimeType } from '@humeai/voice';
import { getSupportedMimeType } from '@humeai/voice';
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
  const [isMuted, setIsMuted] = useState(false);
  const [fft, setFft] = useState<number[]>(generateEmptyFft());
  const currentAnalyzer = useRef<Meyda.MeydaAnalyzer | null>(null);
  const mimeTypeRef = useRef<MimeType | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);

  const sendAudio = useRef(onAudioCaptured);
  sendAudio.current = onAudioCaptured;

  const dataHandler = useCallback((event: BlobEvent) => {
    const blob = event.data;

    blob
      .arrayBuffer()
      .then((buffer) => {
        console.info(btoa(String.fromCharCode(...new Uint8Array(buffer))));
      })
      .catch((err) => console.info(err));

    blob
      .arrayBuffer()
      .then((buffer) => {
        if (buffer.byteLength > 0) {
          sendAudio.current?.(buffer);
        } else {
          console.info('BUFFER NOT SENT');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const start = useCallback(() => {
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
    const mimeType = mimeTypeRef.current;
    if (!mimeType) {
      throw new Error('No MimeType specified');
    }

    recorder.current = new MediaRecorder(stream, {
      mimeType,
    });
    recorder.current.addEventListener('dataavailable', dataHandler);
    recorder.current.start(100);
  }, [dataHandler, streamRef, mimeTypeRef]);

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

      setIsMuted(false);
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
    streamRef.current?.getTracks().forEach((track) => {
      track.enabled = false;
    });
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.start();
    }
    streamRef.current?.getTracks().forEach((track) => {
      track.enabled = true;
    });

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

  useEffect(() => {
    const mimeTypeResult = getSupportedMimeType();
    if (mimeTypeResult.success) {
      mimeTypeRef.current = mimeTypeResult.mimeType;
    } else {
      onError(mimeTypeResult.error.message);
    }
  }, [onError]);

  return {
    start,
    stop,
    mute,
    unmute,
    isMuted,
    fft,
  };
};
