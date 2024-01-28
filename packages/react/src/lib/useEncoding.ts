// cspell:ignore dataavailable

import { useRef, useState } from 'react';

import type { EncodingValues } from './microphone/constants';
import { DEFAULT_ENCODING_VALUES } from './microphone/constants';
import { getStreamSettings } from './microphone/getMicrophoneDefaults';

type PermissionStatus = 'prompt' | 'granted' | 'denied';
type EncodingHook = {
  encodingRef: React.MutableRefObject<EncodingValues>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  getStream: () => Promise<PermissionStatus>;
  permission: PermissionStatus;
  analyserNodeRef: React.MutableRefObject<AnalyserNode | null>;
};

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
  onPermissionChange: (permission: PermissionStatus) => void;
};

const useEncoding = (props: EncodingProps): EncodingHook => {
  const { encodingConstraints, onPermissionChange } = props;
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const encodingRef = useRef<EncodingValues>(DEFAULT_ENCODING_VALUES);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const getStream = async (): Promise<PermissionStatus> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...encodingConstraints,
        },
        video: false,
      });

      setPermission('granted');
      onPermissionChange('granted');
      streamRef.current = stream;

      const context = new AudioContext();
      const input = context.createMediaStreamSource(streamRef.current);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      input.connect(analyserNode);

      analyserNodeRef.current = analyserNode;

      console.log(analyserNode);

      encodingRef.current = getStreamSettings(stream, encodingConstraints);
      return 'granted';
    } catch (e) {
      onPermissionChange('denied');
      setPermission('denied');
      return 'denied';
    }
  };

  return { encodingRef, streamRef, getStream, permission, analyserNodeRef };
};

export { useEncoding };
