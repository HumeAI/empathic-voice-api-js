import { type AudioDevice, useAudioDevices } from '@humeai/voice-react';
import { useCallback, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Select';

type DeviceSelectorProps = {
  onDeviceChange: (deviceId: string) => void;
  onSpeakerChange: (deviceId: string) => void;
};

export const DeviceSelector = ({
  onDeviceChange,
  onSpeakerChange,
}: DeviceSelectorProps) => {
  const {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice,
    refreshDeviceList,
    isLoading,
    error,
  } = useAudioDevices();

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [pendingInputDevice, setPendingInputDevice] = useState<string | null>(
    null,
  );
  const [pendingOutputDevice, setPendingOutputDevice] = useState<string | null>(
    null,
  );

  const handleInputChange = useCallback((value: string) => {
    setPendingInputDevice(value);
  }, []);

  const handleOutputChange = useCallback((value: string) => {
    setPendingOutputDevice(value);
  }, []);

  const handleApply = useCallback(() => {
    if (pendingInputDevice !== null) {
      setSelectedInputDevice(pendingInputDevice);
      onDeviceChange(pendingInputDevice);
      setPendingInputDevice(null);
    }
    if (pendingOutputDevice !== null) {
      setSelectedOutputDevice(pendingOutputDevice);
      onSpeakerChange(pendingOutputDevice);
      setPendingOutputDevice(null);
    }
  }, [
    pendingInputDevice,
    pendingOutputDevice,
    onDeviceChange,
    onSpeakerChange,
    setSelectedInputDevice,
    setSelectedOutputDevice,
  ]);

  const handleInputOpenChange = useCallback(
    (open: boolean) => {
      setIsInputOpen(open);
      if (open) {
        void refreshDeviceList();
      }
    },
    [refreshDeviceList],
  );

  const handleOutputOpenChange = useCallback(
    (open: boolean) => {
      setIsOutputOpen(open);
      if (open) {
        void refreshDeviceList();
      }
    },
    [refreshDeviceList],
  );

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  const hasPendingChanges =
    pendingInputDevice !== null || pendingOutputDevice !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="device-select"
            className="text-sm font-medium text-neutral-300"
          >
            Microphone
          </label>
          <Select
            value={pendingInputDevice ?? selectedInputDevice ?? ''}
            onValueChange={handleInputChange}
            open={isInputOpen}
            onOpenChange={handleInputOpenChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="device-select"
              className="w-full border-neutral-600 bg-neutral-700 text-neutral-100"
            >
              <SelectValue
                placeholder={isLoading ? 'Loading...' : 'Select a microphone'}
              />
            </SelectTrigger>
            <SelectContent className="border-neutral-600 bg-neutral-700">
              {inputDevices.length === 0 ? (
                <SelectItem
                  value="no-devices"
                  disabled
                  className="text-neutral-400"
                >
                  No microphones found
                </SelectItem>
              ) : (
                inputDevices.map((device: AudioDevice) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="text-neutral-100 hover:bg-neutral-600"
                  >
                    {device.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="speaker-select"
            className="text-sm font-medium text-neutral-300"
          >
            Speaker
          </label>
          <Select
            value={pendingOutputDevice ?? selectedOutputDevice ?? ''}
            onValueChange={handleOutputChange}
            open={isOutputOpen}
            onOpenChange={handleOutputOpenChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="speaker-select"
              className="w-full border-neutral-600 bg-neutral-700 text-neutral-100"
            >
              <SelectValue
                placeholder={isLoading ? 'Loading...' : 'Select a speaker'}
              />
            </SelectTrigger>
            <SelectContent className="border-neutral-600 bg-neutral-700">
              {outputDevices.length === 0 ? (
                <SelectItem
                  value="no-speakers"
                  disabled
                  className="text-neutral-400"
                >
                  No speakers found
                </SelectItem>
              ) : (
                outputDevices.map((device: AudioDevice) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="text-neutral-100 hover:bg-neutral-600"
                  >
                    {device.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasPendingChanges && (
        <button
          onClick={handleApply}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          Apply Changes
        </button>
      )}
    </div>
  );
};
