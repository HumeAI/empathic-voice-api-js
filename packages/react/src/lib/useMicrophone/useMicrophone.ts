// cspell:ignore dataavailable

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  MediaRecorder as ExtendableMediaRecorder,
  IBlobEvent,
  IMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export type MicrophoneProps = {
  streamRef: MutableRefObject<MediaStream | null>;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError: (message: string) => void;
};

export const useMicrophone = ({
  onAudioCaptured,
  streamRef,
  onError,
  ...props
}: MicrophoneProps) => {
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const mimeType = 'audio/wav';
  const recorder = useRef<IMediaRecorder | null>(null);

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

  const start = async () => {
    const stream = streamRef.current;
    if (!stream) {
      onError(`Error with microphone: no stream available.`);
    } else {
      await register(await connect());

      recorder.current = new ExtendableMediaRecorder(stream, {
        mimeType,
      });
      recorder.current.addEventListener('dataavailable', dataHandler);
      recorder.current.start(250);
    }
  };

  const stop = useCallback(() => {
    try {
      recorder.current?.stop();
      recorder.current?.removeEventListener('dataavailable', dataHandler);

      streamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      onError(`Error with microphone: ${message}`);
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
