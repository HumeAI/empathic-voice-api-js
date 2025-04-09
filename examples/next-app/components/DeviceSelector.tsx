import { type AudioDevice, useAudioDevices } from '@humeai/voice-react';

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

  if (isLoading) {
    return <div className="text-neutral-400">Loading devices...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  const handleInputChange = (value: string) => {
    setSelectedInputDevice(value);
    onDeviceChange(value);
  };

  const handleOutputChange = (value: string) => {
    setSelectedOutputDevice(value);
    onSpeakerChange(value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="device-select"
          className="text-sm font-medium text-neutral-300"
        >
          Microphone
        </label>
        <Select
          value={selectedInputDevice ?? ''}
          onValueChange={handleInputChange}
          onOpenChange={(open: boolean) => {
            if (open) {
              void refreshDeviceList();
            }
          }}
        >
          <SelectTrigger
            id="device-select"
            className="w-full border-neutral-600 bg-neutral-700 text-neutral-100"
          >
            <SelectValue placeholder="Select a microphone" />
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
          value={selectedOutputDevice ?? ''}
          onValueChange={handleOutputChange}
          onOpenChange={(open: boolean) => {
            if (open) {
              void refreshDeviceList();
            }
          }}
        >
          <SelectTrigger
            id="speaker-select"
            className="w-full border-neutral-600 bg-neutral-700 text-neutral-100"
          >
            <SelectValue placeholder="Select a speaker" />
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
  );
};
