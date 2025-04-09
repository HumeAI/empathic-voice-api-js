import { useCallback, useEffect, useState } from 'react';

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
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [availableSpeakers, setAvailableSpeakers] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

  const getDevices = useCallback(async () => {
    try {
      // First request permission to access audio devices
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately since we only needed it for permission
      stream.getTracks().forEach((track) => track.stop());

      // Now enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(
        (device) => device.kind === 'audioinput',
      );
      const audioOutputDevices = devices.filter(
        (device) => device.kind === 'audiooutput',
      );

      setAvailableDevices(audioInputDevices);
      setAvailableSpeakers(audioOutputDevices);

      // Only set default devices if they exist and have valid IDs
      if (audioInputDevices.length > 0 && audioInputDevices[0].deviceId) {
        setSelectedDevice(audioInputDevices[0].deviceId);
        onDeviceChange(audioInputDevices[0].deviceId);
      }
      if (audioOutputDevices.length > 0 && audioOutputDevices[0].deviceId) {
        setSelectedSpeaker(audioOutputDevices[0].deviceId);
        onSpeakerChange(audioOutputDevices[0].deviceId);
      }
    } catch (error) {
      // Handle error silently as it's not critical for the app to function
    }
  }, [onDeviceChange, onSpeakerChange]);

  useEffect(() => {
    void getDevices();
  }, [getDevices]);

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
          value={selectedDevice}
          onValueChange={(value) => {
            setSelectedDevice(value);
            onDeviceChange(value);
          }}
          onOpenChange={(open) => {
            if (open) {
              void getDevices();
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
            {availableDevices.length === 0 ? (
              <SelectItem
                value="no-devices"
                disabled
                className="text-neutral-400"
              >
                No microphones found
              </SelectItem>
            ) : (
              availableDevices.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId}
                  className="text-neutral-100 hover:bg-neutral-600"
                >
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
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
          value={selectedSpeaker}
          onValueChange={(value) => {
            setSelectedSpeaker(value);
            onSpeakerChange(value);
          }}
          onOpenChange={(open) => {
            if (open) {
              void getDevices();
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
            {availableSpeakers.length === 0 ? (
              <SelectItem
                value="no-speakers"
                disabled
                className="text-neutral-400"
              >
                No speakers found
              </SelectItem>
            ) : (
              availableSpeakers.map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId}
                  className="text-neutral-100 hover:bg-neutral-600"
                >
                  {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
