import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it, vi } from 'vitest';

import { useGetMicrophoneStream } from './useGetMicrophoneStream';

vi.mock('hume', () => ({
  getAudioStream: vi.fn(),
  checkForAudioTracks: vi.fn(),
}));

describe('useGetMicrophoneStream', () => {
  it('is defined', () => {
    expect(useGetMicrophoneStream).toBeDefined();
  });

  it('getStream function works correctly', async () => {
    const { result } = renderHook(() => useGetMicrophoneStream());
    await result.current.getStream();
    expect(result.current.permission).toBe('granted');
  });
});
