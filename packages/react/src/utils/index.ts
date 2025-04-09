import { useCallback, useEffect, useState } from 'react';

export const keepLastN = <T>(n: number, arr: T[]): T[] => {
  if (arr.length <= n) {
    return arr;
  }
  return arr.slice(arr.length - n);
};

export type AudioDevice = {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
};

export type AudioDevices = {
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
};

/**
 * Requests microphone permissions and returns available input devices
 * @returns Promise<AudioDevice[]> - List of available audio input devices
 */
export const getInputDevices = async (): Promise<AudioDevice[]> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audioinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput',
      }));
  } catch (error) {
    console.error('Error getting input devices:', error);
    return [];
  }
};

/**
 * Returns available output devices (speakers)
 * @returns Promise<AudioDevice[]> - List of available audio output devices
 */
export const getOutputDevices = async (): Promise<AudioDevice[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audiooutput',
      }));
  } catch (error) {
    console.error('Error getting output devices:', error);
    return [];
  }
};

/**
 * Gets both input and output devices in a single call
 * @returns Promise<AudioDevices> - Object containing both input and output devices
 */
export const getAllAudioDevices = async (): Promise<AudioDevices> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();

    const inputDevices = devices
      .filter((device) => device.kind === 'audioinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput',
      }));

    const outputDevices = devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audiooutput',
      }));

    return { inputDevices, outputDevices };
  } catch (error) {
    console.error('Error getting audio devices:', error);
    return { inputDevices: [], outputDevices: [] };
  }
};

type UseAudioDevicesOptions = {
  autoFetch?: boolean;
};

type UseAudioDevicesReturn = {
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  selectedInputDevice: string | null;
  selectedOutputDevice: string | null;
  setSelectedInputDevice: (deviceId: string | null) => void;
  setSelectedOutputDevice: (deviceId: string | null) => void;
  refetchDevices: () => Promise<void>;
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
    isLoading,
    error,
  };
};
