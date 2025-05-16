// cspell:ignore dataavailable
import { checkForAudioTracks, getAudioStream } from 'hume';
import { useCallback, useRef, useState } from 'react';

import type { AudioConstraints } from '../models/connect-options';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const useGetMicrophoneStream = () => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');
  const currentStream = useRef<MediaStream | null>(null);

  const getStream = useCallback(
    async (audioConstraints: AudioConstraints = {}) => {
      let stream;
      try {
        stream = await getAudioStream(audioConstraints);
      } catch (e) {
        if (
          e instanceof DOMException &&
          'name' in e &&
          e.name === 'NotAllowedError'
        ) {
          setPermission('denied');
        }
        throw e;
      }

      setPermission('granted');

      checkForAudioTracks(stream);

      currentStream.current = stream;

      return stream;
    },
    [],
  );

  const stopStream = useCallback(() => {
    if (currentStream.current) {
      currentStream.current.getTracks().forEach((track) => track.stop());
      currentStream.current = null;
    }
  }, []);

  return {
    getStream,
    stopStream,
    permission,
  };
};
