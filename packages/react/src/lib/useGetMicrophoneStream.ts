// cspell:ignore dataavailable
import { checkForAudioTracks, getAudioStream } from 'hume';
import { useCallback, useState } from 'react';

import type { AudioConstraints } from '../models/connect-options';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const useGetMicrophoneStream = () => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const getStream = useCallback(
    async (audioConstraints: AudioConstraints = {}) => {
      try {
        const stream = await getAudioStream(audioConstraints);

        setPermission('granted');

        checkForAudioTracks(stream);

        return stream;
      } catch (e) {
        setPermission('denied');
        throw e;
      }
    },
    [],
  );

  return {
    getStream,
    permission,
  };
};
