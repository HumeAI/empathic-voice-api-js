// cspell:ignore dataavailable
import { checkForAudioTracks, getAudioStream } from 'hume';
import { useCallback, useRef, useState } from 'react';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

const useEncoding = () => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const streamRef = useRef<MediaStream | null>(null);

  const getStream = useCallback(
    async (
      echoCancellation: boolean = true,
      noiseSuppression: boolean = true,
      autoGainControl: boolean = true,
    ) => {
      try {
        const stream = await getAudioStream(
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        );

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
