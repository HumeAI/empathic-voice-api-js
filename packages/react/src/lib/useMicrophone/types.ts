import { MutableRefObject } from 'react';
import { EncodingValues } from './constants';

export type MicrophoneProps = {
  streamRef: MutableRefObject<MediaStream | null>;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (message: string, error: Error) => void;
};

export type MicrophoneHook = {
  start: () => void;
  stop: () => void;
  mute: () => void;
  unmute: () => void;
  isMuted: boolean;
};
