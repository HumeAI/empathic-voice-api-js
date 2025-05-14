// cspell:ignore dataavailable
import type { MimeType } from 'hume';
import { getBrowserSupportedMimeType } from 'hume';
import Meyda from 'meyda';
import type { MeydaFeaturesObject } from 'meyda';
import { useCallback, useEffect, useRef, useState } from 'react';

import { generateEmptyFft } from './generateEmptyFft';
import type { MicErrorReason } from './VoiceProvider';

export type MicrophoneProps = {
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError: (message: string, reason: MicErrorReason) => void;
};

export const useMicrophone = (props: MicrophoneProps) => {
  const { onAudioCaptured, onError } = props;
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  const currentStream = useRef<MediaStream | null>(null);

  const [fft, setFft] = useState<number[]>(generateEmptyFft());
  const currentAnalyzer = useRef<Meyda.MeydaAnalyzer | null>(null);
  const mimeTypeRef = useRef<MimeType | null>(null);

  const audioContext = useRef<AudioContext | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);

  const sendAudio = useRef(onAudioCaptured);
  sendAudio.current = onAudioCaptured;

  const dataHandler = useCallback((event: BlobEvent) => {
    const blob = event.data;

    blob
      .arrayBuffer()
      .then((buffer) => {
        if (buffer.byteLength > 0) {
          sendAudio.current?.(buffer);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const start = useCallback(
    (stream: MediaStream) => {
      if (!stream) {
        throw new Error('No stream connected');
      }

      currentStream.current = stream;

      const context = new AudioContext();
      audioContext.current = context;
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
    },
    [dataHandler, mimeTypeRef],
  );

  const stop = useCallback(() => {
    try {
      if (currentAnalyzer.current) {
        currentAnalyzer.current.stop();
        currentAnalyzer.current = null;
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

      recorder.current?.stop();
      recorder.current?.removeEventListener('dataavailable', dataHandler);
      recorder.current = null;
      currentStream.current?.getTracks().forEach((track) => track.stop());

      setIsMuted(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      onError(`Error stopping microphone: ${message}`, 'mic_closure_failure');
      void true;
    }
  }, [dataHandler, onError]);

  const mute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.stop();
      setFft(generateEmptyFft());
    }

    currentStream.current?.getTracks().forEach((track) => {
      track.enabled = false;
    });

    isMutedRef.current = true;
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.start();
    }

    currentStream.current?.getTracks().forEach((track) => {
      track.enabled = true;
    });

    isMutedRef.current = false;
    setIsMuted(false);
  }, [currentStream]);

  useEffect(() => {
    return () => {
      try {
        recorder.current?.stop();
        recorder.current?.removeEventListener('dataavailable', dataHandler);

        if (currentAnalyzer.current) {
          currentAnalyzer.current.stop();
          currentAnalyzer.current = null;
        }

        currentStream.current?.getTracks().forEach((track) => track.stop());
        currentStream.current = null;
      } catch (e) {
        console.log(e);
        void true;
      }
    };
  }, [dataHandler, currentStream]);

  useEffect(() => {
    const mimeTypeResult = getBrowserSupportedMimeType();
    if (mimeTypeResult.success) {
      mimeTypeRef.current = mimeTypeResult.mimeType;
    } else {
      onError(mimeTypeResult.error.message, 'mime_types_not_supported');
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
