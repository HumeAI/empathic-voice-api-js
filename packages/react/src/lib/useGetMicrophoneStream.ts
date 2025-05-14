// cspell:ignore dataavailable
import { checkForAudioTracks, getAudioStream } from 'hume';
import { useCallback, useState } from 'react';

import type { AudioConstraints } from '../models/connect-options';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const useGetMicrophoneStream = () => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const getStream = useCallback(
    async (audioConstraints: AudioConstraints = {}) => {
      let stream;
      try {
        stream = await getAudioStream(audioConstraints);
      } catch (e) {
        setPermission('denied');
        throw e;
      }

      setPermission('granted');

      checkForAudioTracks(stream);

      return stream;
    },
    [],
  );

  return {
    getStream,
    permission,
  };
};
