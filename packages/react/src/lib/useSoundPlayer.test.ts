/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { renderHook } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { describe, expect, test, vi } from 'vitest';

import { useSoundPlayer } from './useSoundPlayer';
import type { AudioOutputMessage } from '../models/messages';

vi.mock('hume', () => ({
  convertBase64ToBlob: () => ({
    arrayBuffer: () => {
      return [];
    },
  }),
}));

window.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    gain: {
      value: 1,
    },
  })),
  createAnalyser: vi.fn().mockImplementation(() => ({
    fftSize: 0,
    connect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(),
  createMediaElementSource: vi.fn(),
  createBufferSource: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    loop: false,
  })),
  decodeAudioData: vi
    .fn()
    .mockImplementation(
      (buffer, successCallback: (buf: AudioBuffer) => void, _errorCallback) => {
        successCallback({ sampleRate: 44100 } as AudioBuffer); // Provide a mock AudioBuffer
      },
    ),
  destination: {},
}));

describe('useSoundPlayer', () => {
  test('should initialize with default values', async () => {
    const onErrorMock = vi.fn((message: string) => {
      console.log('error: ', message);
    });
    const onPlayAudioMock = vi.fn((id: string) => {
      console.log('playing: ', id);
    });
    const onStopAudioMock = vi.fn((id: string) => {
      console.log('stopping: ', id);
    });

    const hook = renderHook(() =>
      useSoundPlayer({
        onError: onErrorMock,
        onPlayAudio: onPlayAudioMock,
        onStopAudio: onStopAudioMock,
      }),
    );

    expect(onErrorMock).not.toBeCalled();
    expect(onPlayAudioMock).not.toBeCalled();
    expect(onStopAudioMock).not.toBeCalled();
    expect(hook.result.current.queueLength).toBe(0);

    hook.result.current.initPlayer();

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    void hook.result.current.addToQueue(
      fromPartial<AudioOutputMessage>({
        data: 'abc',
        id: 'this-is-an-id',
        index: 0,
      }),
    );

    await vi.waitFor(() => expect(hook.result.current.isPlaying).toBe(true));

    await vi.waitFor(() =>
      expect(onPlayAudioMock).toBeCalledWith('this-is-an-id'),
    );
  });
});
