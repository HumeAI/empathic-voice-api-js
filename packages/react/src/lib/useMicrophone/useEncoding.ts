// cspell:ignore dataavailable

import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_ENCODING_VALUES, EncodingValues } from './constants';
import { getStreamSettings } from './getMicrophoneDefaults';

type EncodingHook = {
  encoding: EncodingValues;
  permission: 'prompt' | 'granted' | 'denied';
  streamRef: React.MutableRefObject<MediaStream | null>;
  getStream: () => Promise<void>;
};

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
};

const useEncoding = (props: EncodingProps): EncodingHook => {
  const { encodingConstraints } = props;

  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>(
    'prompt',
  );
  const [encoding, setEncodingValues] = useState<EncodingValues>(
    DEFAULT_ENCODING_VALUES,
  );

  const getStream = async () => {
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

      console.log('getStream', stream);

      setPermission('granted');
      streamRef.current = stream;
      setEncodingValues(getStreamSettings(stream, encodingConstraints));
    } catch (e) {
      console.log(e);
      setPermission('denied');
    }
  };

  return { encoding, permission, streamRef, getStream };
};

export { useEncoding };
