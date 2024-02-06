// cspell:ignore dataavailable

import { useCallback, useRef, useState } from 'react';

import type { EncodingValues } from './microphone/constants';
import { DEFAULT_ENCODING_VALUES } from './microphone/constants';
import { getStreamSettings } from './microphone/getMicrophoneDefaults';

type PermissionStatus = 'prompt' | 'granted' | 'denied';
type EncodingHook = {
  encodingRef: React.MutableRefObject<EncodingValues>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  getStream: () => Promise<PermissionStatus>;
  permission: PermissionStatus;
};

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
};

const useEncoding = (props: EncodingProps): EncodingHook => {
  const { encodingConstraints } = props;
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const encodingRef = useRef<EncodingValues>(DEFAULT_ENCODING_VALUES);
  const streamRef = useRef<MediaStream | null>(null);

  const getStream = useCallback(async () => {
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
      streamRef.current = stream;

      encodingRef.current = getStreamSettings(stream, encodingConstraints);

      return 'granted' as const;
    } catch (e) {
      setPermission('denied');
      return 'denied' as const;
    }
  }, [encodingConstraints]);

  return {
    encodingRef,
    streamRef,
    getStream,
    permission,
  };
};

export { useEncoding };
