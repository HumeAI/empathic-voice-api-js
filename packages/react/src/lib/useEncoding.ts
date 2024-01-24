// cspell:ignore dataavailable

import { useCallback, useRef, useState } from 'react';
import Meyda from 'meyda';
import type { MeydaFeaturesObject } from 'meyda';

import type { EncodingValues } from './microphone/constants';
import { DEFAULT_ENCODING_VALUES } from './microphone/constants';
import { getStreamSettings } from './microphone/getMicrophoneDefaults';
import { generateEmptyFft } from './useSoundPlayer';

type PermissionStatus = 'prompt' | 'granted' | 'denied';
type EncodingHook = {
  encodingRef: React.MutableRefObject<EncodingValues>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  getStream: () => Promise<PermissionStatus>;
  permission: PermissionStatus;
  analyserNodeRef: React.MutableRefObject<AnalyserNode | null>;
  fft: number[];
};

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
};

const useEncoding = (props: EncodingProps): EncodingHook => {
  const { encodingConstraints } = props;
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const encodingRef = useRef<EncodingValues>(DEFAULT_ENCODING_VALUES);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const [fft, setFft] = useState<number[]>(generateEmptyFft());

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

      const context = new AudioContext();
      const input = context.createMediaStreamSource(stream);

      encodingRef.current = getStreamSettings(stream, encodingConstraints);

      let analyzer: ReturnType<typeof Meyda.createMeydaAnalyzer>;
      try {
        analyzer = Meyda.createMeydaAnalyzer({
          audioContext: context,
          source: input,
          featureExtractors: ['loudness'],
          callback: (features: MeydaFeaturesObject) => {
            const newFft = features.loudness.specific || [];
            setFft(() => Array.from(newFft));
          },
        });

        analyzer.start();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Failed to start audio analyzer: ${message}`);
      }

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
    analyserNodeRef,
    fft,
  };
};

export { useEncoding };
