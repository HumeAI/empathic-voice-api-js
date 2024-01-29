// cspell:ignore dataavailable

import { useRef, useState } from 'react';

import type { EncodingValues } from './microphone/constants';
import { DEFAULT_ENCODING_VALUES } from './microphone/constants';
import { getStreamSettings } from './microphone/getMicrophoneDefaults';

type PermissionStatus = 'prompt' | 'granted' | 'denied';
type EncodingHook = {
  encodingRef: React.MutableRefObject<EncodingValues>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  getStream: () => Promise<PermissionStatus>;
  permission: PermissionStatus;
  analyserNodeRef: React.MutableRefObject<AnalyserNode | null>;
  fft: number[];
};

function generateEmptyFft(): number[] {
  return Array.from({ length: 24 }).map(() => 0);
}

type EncodingProps = {
  encodingConstraints: Partial<EncodingValues>;
  onPermissionChange: (permission: PermissionStatus) => void;
};

const useEncoding = (props: EncodingProps): EncodingHook => {
  const { encodingConstraints, onPermissionChange } = props;
  const [permission, setPermission] = useState<PermissionStatus>('prompt');

  const encodingRef = useRef<EncodingValues>(DEFAULT_ENCODING_VALUES);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const [fft, setFft] = useState<number[]>(generateEmptyFft());

  const getStream = async (): Promise<PermissionStatus> => {
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
      onPermissionChange('granted');
      streamRef.current = stream;

      const context = new AudioContext();
      const input = context.createMediaStreamSource(streamRef.current);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      input.connect(analyserNode);

      analyserNodeRef.current = analyserNode;

      encodingRef.current = getStreamSettings(stream, encodingConstraints);
      return 'granted';
    } catch (e) {
      onPermissionChange('denied');
      setPermission('denied');
      return 'denied';
    }
  };

  setInterval(() => {
    if (analyserNodeRef.current) {
      const data = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
      analyserNodeRef.current.getByteFrequencyData(data);

      const getAverage = (array: Uint8Array) => {
        const count = array.length;
        return array.reduce((a, b) => {
          return a + b / count;
        }, 0);
      };

      const getBatches = (array: Uint8Array, n_batches: number) => {
        const batchSize = array.length / n_batches;
        const batches = [];
        for (let i = 0; i < n_batches; i++) {
          const batch = array.slice(i * batchSize, (i + 1) * batchSize);
          batches.push(batch);
        }

        return batches;
      };

      const getAverageBatchHeight = (array: Uint8Array): number[] => {
        const barHeights: number[] = [];
        const batches = getBatches(array, 24);

        for (let i = 0; i < 24; i++) {
          const batch = batches[i];
          const average = getAverage(batch!);
          barHeights[i] = average;
        }

        return barHeights;
      };

      setFft(getAverageBatchHeight(data) as unknown as number[]);
    }
  }, 1000 / 60);

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
