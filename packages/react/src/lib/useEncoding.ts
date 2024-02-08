// cspell:ignore dataavailable
import {
  DEFAULT_ENCODING_VALUES,
  type EncodingValues,
  getAudioStream,
  getStreamSettings,
} from '@humeai/assistant';
import { useCallback, useRef, useState } from 'react';

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
