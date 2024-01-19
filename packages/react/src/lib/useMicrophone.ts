// cspell:ignore dataavailable

import type { Channels } from '@humeai/assistant';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MicrophoneProps = {
  numChannels?: Channels;
  sampleRate?: number;
  mimeType?: string;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (message: string, error: Error) => void;
};

export const useMicrophone = ({
  numChannels,
  sampleRate,
  onAudioCaptured,
  ...props
}: MicrophoneProps) => {
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const mimeType = props.mimeType ?? 'audio/webm';
  const recorder = useRef<MediaRecorder | null>(null);

  const sendAudio = useRef(onAudioCaptured);
  sendAudio.current = onAudioCaptured;

  const dataHandler = useCallback((event: BlobEvent) => {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: numChannels,
          sampleRate,
        },
        video: false,
      });

      if (!stream) {
        throw new Error('No stream connected');
      }

      recorder.current = new MediaRecorder(stream, { mimeType });

      recorder.current.addEventListener('dataavailable', dataHandler);

      recorder.current.start(250);
    } catch (e) {
      void true;
    }
  }, [dataHandler, mimeType, numChannels, sampleRate]);

  const stop = useCallback(() => {
    try {
      recorder.current?.stop();
      recorder.current?.removeEventListener('dataavailable', dataHandler);
    } catch (e) {
      void true;
    }
  }, [dataHandler]);

  const mute = useCallback(() => {
    isMutedRef.current = true;
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    isMutedRef.current = false;
    setIsMuted(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    start,
    stop,
    mute,
    unmute,
    isMuted,
  };
};
