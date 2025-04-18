// cspell:ignore dataavailable
import { checkForAudioTracks, getAudioStream } from 'hume';
import { useCallback, useRef, useState } from 'react';

import type { AudioConstraints } from '../models/connect-options';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

const useEncoding = () => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const streamRef = useRef<MediaStream | null>(null);

  const getStream = useCallback(
    async (audioConstraints: AudioConstraints = {}) => {
      try {
        const stream = await getAudioStream(audioConstraints);

        setPermission('granted');
        streamRef.current = stream;

        checkForAudioTracks(stream);

        return 'granted' as const;
      } catch (e) {
        setPermission('denied');
        return 'denied' as const;
      }
    },
    [],
  );

  return {
    streamRef,
    getStream,
    permission,
  };
};

export { useEncoding };
