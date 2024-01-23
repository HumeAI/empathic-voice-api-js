// cspell:ignore dataavailable

import type { Channels } from '@humeai/assistant';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MicrophoneProps = {
  numChannels?: Channels;
  sampleRate?: number;
  onAudioCaptured: (b: Float32Array[]) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError?: (message: string, error: Error) => void;
};

export const useMicrophone = ({
  numChannels = 2,
  sampleRate = 48000,
  onAudioCaptured,
  ...props
}: MicrophoneProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: numChannels,
          sampleRate,
        },
        video: false,
      });

      const audioContext = new AudioContext({ sampleRate });
      const speakers = audioContext.destination;
      const audioInputSource = audioContext.createMediaStreamSource(stream);

      const channelCount = audioInputSource.channelCount;
      const streamSampleRate = audioInputSource.context.sampleRate;

      try {
        console.log(channelCount);
        await audioContext.audioWorklet.addModule('AudioWorklet.js');
        console.log('Worklet module loaded');
      } catch (error) {
        console.error('Error adding worklet module', error);
      }

      const recorderNode = new AudioWorkletNode(
        audioContext,
        'recorder.worklet',
      );

      recorderNode.port.onmessage = (event) => {
        onAudioCaptured(event.data);
      };
      audioInputSource.connect(recorderNode);

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      audioInputSource.connect(analyserNode);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      analyserNodeRef.current = analyserNode;

      setIsRecording(true);
      props.onStartRecording?.();
    } catch (error) {
      props.onError?.('Error starting recording', error as Error);
    }
  }, [numChannels, onAudioCaptured, props, sampleRate]);

  const stop = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
    props.onStopRecording?.();
  }, [props]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const mute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsMuted(true);
    }
  }, []);

  const unmute = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.enabled = true;
      });
      setIsMuted(false);
    }
  }, []);

  return {
    start,
    stop,
    mute,
    unmute,
    isRecording,
    isMuted,
    analyserNode: analyserNodeRef.current,
  };
};
