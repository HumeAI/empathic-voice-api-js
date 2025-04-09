// cspell:ignore dataavailable
import { checkForAudioTracks } from 'hume';
import { useCallback, useRef, useState } from 'react';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

const useEncoding = (deviceId?: string) => {
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const streamRef = useRef<MediaStream | null>(null);

  const getStream = useCallback(async () => {
    try {
      // First try with the specified device ID
      if (deviceId) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
          });
          setPermission('granted');
          streamRef.current = stream;
          checkForAudioTracks(stream);
          return 'granted' as const;
        } catch (deviceError) {
          // If the specified device fails, fall back to default
          console.warn(
            `Failed to use specified microphone: ${deviceError instanceof Error ? deviceError.message : 'Unknown error'}`,
          );
        }
      }

      // Fall back to default microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setPermission('granted');
      streamRef.current = stream;
      checkForAudioTracks(stream);
      return 'granted' as const;
    } catch (e) {
      setPermission('denied');
      return 'denied' as const;
    }
  }, [deviceId]);

  return {
    streamRef,
    getStream,
    permission,
  };
};

export { useEncoding };
