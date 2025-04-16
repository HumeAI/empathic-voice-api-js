import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { generateEmptyFft } from './generateEmptyFft';
import { useSoundPlayer } from './useSoundPlayer';

describe('useSoundPlayer', () => {
  it('should initialize with correct default state', () => {
    const mockOnError = vi.fn();
    const mockOnPlayAudio = vi.fn();
    const mockOnStopAudio = vi.fn();

    const { result } = renderHook(() =>
      useSoundPlayer({
        onError: mockOnError,
        onPlayAudio: mockOnPlayAudio,
        onStopAudio: mockOnStopAudio,
      }),
    );

    expect(result.current.volume).toBe(1.0); // full volume
    expect(result.current.isAudioMuted).toBe(false); // not muted
    expect(result.current.isPlaying).toBe(false); // not playing
    expect(result.current.queueLength).toBe(0); // empty queue
    expect(result.current.fft).toEqual(generateEmptyFft()); // empty fft
  });
});
