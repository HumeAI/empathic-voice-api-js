// cspell:ignore dataavailable

import type { Channels } from '@humeai/assistant';
import { useCallback, useEffect, useRef, useState } from 'react';
import { detect } from 'detect-browser';

import {
  MediaRecorder as ExtendableMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export type MicrophoneProps = {
  numChannels?: Channels;
  sampleRate?: number;
  mimeType?: string;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (message: string, error: Error) => void;
  onMicPermissionChange: (permission: 'prompt' | 'granted' | 'denied') => void;
};

export const useMicrophone = ({
  numChannels,
  sampleRate,
  onAudioCaptured,
  onMicPermissionChange,
  ...props
}: MicrophoneProps) => {
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  const mimeType = 'audio/wav';
  // const mimeType = props.mimeType ?? 'audio/webm';
  const recorder = useRef<MediaRecorder | null>(null);

  const sendAudio = useRef(onAudioCaptured);
  sendAudio.current = onAudioCaptured;

  const dataHandler = useCallback((event: BlobEvent) => {
    const blob = event.data;

    if (isMutedRef.current) {
      return;
    }

    blob
      .arrayBuffer()
      .then((buffer) => {
        sendAudio.current?.(buffer);
      })
      .catch(() => {});
  }, []);

  const getStreamSettings = (stream: MediaStream) => {
    const browserInfo = detect();
    if (!browserInfo) {
      console.warn('No browser info available.');
    }
    const { name: browserName } = browserInfo || {};

    const tracks = stream.getAudioTracks();
    if (tracks.length === 0) {
      throw new Error('No audio tracks');
    }
    if (tracks.length > 1) {
      throw new Error('Multiple audio tracks');
    }
    const track = tracks[0];
    if (!track) {
      throw new Error('No audio track');
    }

    const settings = track.getSettings();
    if (!settings) {
      throw new Error('No audio track settings');
    }

    let { sampleRate, channelCount } = settings;

    /**
     * macbook pro
     * arc -     pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
     * chrome -  pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
     * firefox - pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
     * safari -  pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 2 channels, s16, 1536 kb/s
     */

    if (!sampleRate) {
      console.warn(
        'No audio track sample rate found in stream settings. This may lead to decoding issues when sending linear PCM to downstream consumers.',
      );
      console.warn(`Using default sample rate for ${browserName}.`)
      switch (browserName) {
        case 'chrome':
        case 'firefox':
          sampleRate = 48000;
          break;
        case 'safari':
          sampleRate = 48000;
          break;
        default:
          sampleRate = 48000;
      }
    }

    if (!channelCount) {
      console.warn(
        'No audio track channel count found in stream settings. This may lead to decoding issues when sending linear PCM to downstream consumers.',
      );
      console.warn(`Using default channel count for ${browserName}.`)

      switch (browserName) {
        case 'chrome':
        case 'firefox':
          channelCount = 1;
          break;
        case 'safari':
          channelCount = 2;
          break;
        default:
          channelCount = 1;
      }
    }

    return {
      sampleRate,
      channelCount,
    };
  };

  const warnOnUnsupportedMicrophoneSettings = () => {
    const supportedConstraints =
      navigator.mediaDevices.getSupportedConstraints();
    const browserInfo = detect();
    if (!browserInfo) {
      console.warn('No browser info available.');
    }
    const { name: browserName } = browserInfo || {};

    const constraints = ['sampleRate', 'channelCount'];
    for (const constraint of constraints) {
      if (Object.keys(supportedConstraints).indexOf(constraint) === -1) {
        console.warn(
          `Microphone constraint ${constraint} is not supported by ${browserName}. This may lead to decoding issues when sending linear PCM to downstream consumers.`,
        );
      }
    }
  };

  useEffect(() => {
    warnOnUnsupportedMicrophoneSettings();
  }, []);

  const start = useCallback(async () => {
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: numChannels,
          sampleRate,
        },
        video: false,
      });
      onMicPermissionChange('granted');
    } catch (e) {
      onMicPermissionChange('denied');
    }

    try {
      if (!stream) {
        throw new Error('No stream connected');
      }

      const streamSettings = getStreamSettings(stream);
      console.log(streamSettings);

      await register(await connect());

      // @ts-ignore
      recorder.current = new ExtendableMediaRecorder(stream, { mimeType });

      // @ts-ignore
      recorder.current.addEventListener('dataavailable', dataHandler);

      // @ts-ignore
      recorder.current.start(250);
    } catch (e) {
      void true;
    }
  }, [dataHandler, mimeType, numChannels, sampleRate]);

  const stop = useCallback(() => {
    try {
      recorder.current?.stop();
      recorder.current?.removeEventListener('dataavailable', dataHandler);
    } catch (e) {
      void true;
    }
  }, [dataHandler]);

  const mute = useCallback(() => {
    isMutedRef.current = true;
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    isMutedRef.current = false;
    setIsMuted(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    start,
    stop,
    mute,
    unmute,
    isMuted,
    // actualSampleRate: recorder.current?.sampleRate,
    // actualChannelCount: recorder.current?.audioChannels,
    // actualMimeType: recorder.current?.mimeType,
  };
};
