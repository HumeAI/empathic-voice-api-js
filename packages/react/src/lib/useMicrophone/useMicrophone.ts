// cspell:ignore dataavailable

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  MediaRecorder as ExtendableMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import {
  DEFAULT_ENCODING_VALUES,
} from './constants';
import { getStreamSettings } from './getMicrophoneDefaults';

export type MicrophoneProps = {
  encodingConstraints: Partial<typeof DEFAULT_ENCODING_VALUES>;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (message: string, error: Error) => void;
  onMicPermissionChange: (permission: 'prompt' | 'granted' | 'denied') => void;
};

export const useMicrophone = ({
  encodingConstraints,
  onAudioCaptured,
  onMicPermissionChange,
  ...props
}: MicrophoneProps) => {
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const [realEncodingValues, setRealEncodingValues] = useState<{
    sampleRate: number;
    channelCount: number;
  }>(DEFAULT_ENCODING_VALUES);

  const mimeType = 'audio/wav';
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
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...encodingConstraints,
        },
        video: false,
      });
      onMicPermissionChange('granted');
    } catch (e) {
      onMicPermissionChange('denied');
    }

    try {
      if (!stream) {
        throw new Error('No stream connected');
      }

      const { sampleRate: realSampleRate, channelCount: realNumChannels } =
        getStreamSettings(stream, encodingConstraints);
      setRealEncodingValues({
        sampleRate: realSampleRate,
        channelCount: realNumChannels,
      });

      await register(await connect());

      // @ts-ignore
      recorder.current = new ExtendableMediaRecorder(stream, { mimeType });

      // @ts-ignore
      recorder.current.addEventListener('dataavailable', dataHandler);

      // @ts-ignore
      recorder.current.start(250);
    } catch (e) {
      void true;
    }
  }, [dataHandler, mimeType, encodingConstraints]);

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
    realEncodingValues,
  };
};