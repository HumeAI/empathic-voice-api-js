import { useCallback, useEffect, useState } from 'react';

import type { AudioDevice } from '../utils';
import { getAllAudioDevices } from '../utils';

export type UseAudioDevicesOptions = {
  autoFetch?: boolean;
};

export type UseAudioDevicesReturn = {
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  selectedInputDevice: string | null;
  selectedOutputDevice: string | null;
  setSelectedInputDevice: (deviceId: string | null) => void;
  setSelectedOutputDevice: (deviceId: string | null) => void;
  refetchDevices: () => Promise<void>;
  refreshDeviceList: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook to manage audio device selection and state
 * @param options - Configuration options
 * @returns Object containing device lists, selection state, and utility functions
 */
export const useAudioDevices = ({
  autoFetch = true,
}: UseAudioDevicesOptions = {}): UseAudioDevicesReturn => {
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string | null>(
    null,
  );
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshDeviceList = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const newInputDevices = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'audioinput',
        }));

      const newOutputDevices = devices
        .filter((device) => device.kind === 'audiooutput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'audiooutput',
        }));

      setInputDevices(newInputDevices);
      setOutputDevices(newOutputDevices);

      // Update selected devices if they no longer exist
      if (
        selectedInputDevice &&
        !newInputDevices.some(
          (device) => device.deviceId === selectedInputDevice,
        )
      ) {
        setSelectedInputDevice(newInputDevices[0]?.deviceId ?? null);
      }

      if (
        selectedOutputDevice &&
        !newOutputDevices.some(
          (device) => device.deviceId === selectedOutputDevice,
        )
      ) {
        setSelectedOutputDevice(newOutputDevices[0]?.deviceId ?? null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to refresh devices'),
      );
    }
  }, [selectedInputDevice, selectedOutputDevice]);

  const refetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { inputDevices: newInputDevices, outputDevices: newOutputDevices } =
        await getAllAudioDevices();

      setInputDevices(newInputDevices);
      setOutputDevices(newOutputDevices);

      // Update selected devices if they no longer exist
      if (
        selectedInputDevice &&
        !newInputDevices.some(
          (device) => device.deviceId === selectedInputDevice,
        )
      ) {
        setSelectedInputDevice(newInputDevices[0]?.deviceId ?? null);
      }

      if (
        selectedOutputDevice &&
        !newOutputDevices.some(
          (device) => device.deviceId === selectedOutputDevice,
        )
      ) {
        setSelectedOutputDevice(newOutputDevices[0]?.deviceId ?? null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch devices'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedInputDevice, selectedOutputDevice]);

  useEffect(() => {
    if (autoFetch) {
      void refetchDevices();
    }
  }, [autoFetch, refetchDevices]);

  return {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice,
    refetchDevices,
    refreshDeviceList,
    isLoading,
    error,
  };
};
