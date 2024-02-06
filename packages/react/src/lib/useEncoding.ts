// cspell:ignore dataavailable

import { useCallback, useRef, useState } from 'react';

import {
  type EncodingValues,
  DEFAULT_ENCODING_VALUES,
  getStreamSettings,
  getAudioStream,
} from '@humeai/assistant';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
};

const useEncoding = (props: EncodingProps) => {
  const { encodingConstraints } = props;
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const encodingRef = useRef<EncodingValues>(DEFAULT_ENCODING_VALUES);
  const streamRef = useRef<MediaStream | null>(null);

  const getStream = useCallback(async () => {
    try {
      const stream = await getAudioStream(encodingConstraints);

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
