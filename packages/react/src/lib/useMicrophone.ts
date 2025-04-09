// cspell:ignore dataavailable
import type { MimeType } from 'hume';
import { getBrowserSupportedMimeType } from 'hume';
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
  deviceId?: string;
};

export const useMicrophone = (props: MicrophoneProps) => {
  const { streamRef, onAudioCaptured, onError } = props;
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);

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
          console.log(
            'Sending audio chunk of size:',
            buffer.byteLength,
            'bytes',
          );
          sendAudio.current?.(buffer);
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

    // Check if the stream has audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('No audio tracks found in the provided stream');
    }

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

    try {
      // Stop any existing recorder
      if (recorder.current) {
        recorder.current.removeEventListener('dataavailable', dataHandler);
        recorder.current.stop();
        recorder.current = null;
      }

      // Create new recorder with the current stream
      recorder.current = new MediaRecorder(stream, {
        mimeType,
      });

      // Add the data handler before starting
      recorder.current.addEventListener('dataavailable', dataHandler);

      // Start recording with a small timeslice to ensure regular data chunks
      recorder.current.start(100);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to create MediaRecorder';
      onError(message);
      throw new Error(message);
    }
  }, [dataHandler, streamRef, mimeTypeRef, onError]);

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

      // Remove the dataavailable event listener before stopping
      recorder.current?.removeEventListener('dataavailable', dataHandler);
      recorder.current?.stop();
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

    isMutedRef.current = true;
    setIsMuted(true);
  }, [streamRef]);

  const unmute = useCallback(() => {
    if (currentAnalyzer.current) {
      currentAnalyzer.current.start();
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.enabled = true;
    });

    isMutedRef.current = false;
    setIsMuted(false);
  }, [streamRef]);

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
    const mimeTypeResult = getBrowserSupportedMimeType();
    if (mimeTypeResult.success) {
      mimeTypeRef.current = mimeTypeResult.mimeType;
      console.log('Using MIME type:', mimeTypeResult.mimeType);
    } else {
      onError(mimeTypeResult.error.message);
    }
  }, [onError]);

  useEffect(() => {
    const updateMicrophoneDevice = async () => {
      if (!streamRef.current) return;

      try {
        // Stop the current stream and recorder
        stop();

        // Get new stream with updated device ID
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: props.deviceId ? { exact: props.deviceId } : undefined,
          },
        });

        // Update the stream reference
        streamRef.current = newStream;

        // Initialize new audio context and analyzer
        const context = new AudioContext();
        audioContext.current = context;
        const input = context.createMediaStreamSource(newStream);

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

        // Always restart recording to ensure we're sending audio data
        const mimeType = mimeTypeRef.current;
        if (!mimeType) {
          throw new Error('No MimeType specified');
        }

        try {
          // Create new recorder with the new stream
          const newRecorder = new MediaRecorder(newStream, {
            mimeType,
          });

          // Add the data handler to the new recorder
          newRecorder.addEventListener('dataavailable', dataHandler);
          newRecorder.start(100);

          // Update the recorder reference
          recorder.current = newRecorder;

          console.log('Started recording with new microphone');
        } catch (e) {
          const message =
            e instanceof Error ? e.message : 'Failed to create MediaRecorder';
          onError(message);
          throw new Error(message);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onError(`Failed to update microphone device: ${errorMessage}`);
      }
    };

    void updateMicrophoneDevice();
  }, [props.deviceId, stop, streamRef, onError, dataHandler]);

  return {
    start,
    stop,
    mute,
    unmute,
    isMuted,
    fft,
  };
};
