import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';

import { DEFAULT_ENCODING_VALUES } from '../microphone/constants';
import { useEncoding } from '../useEncoding';

describe('useEncoding', () => {
  it('is defined', () => {
    expect(useEncoding).toBeDefined();
  });

  it('returns the correct initial state', () => {
    const { result } = renderHook(() =>
      useEncoding({ encodingConstraints: {} }),
    );
    expect(result.current.encodingRef.current).toEqual(DEFAULT_ENCODING_VALUES);
    expect(result.current.streamRef.current).toBeNull();
    expect(result.current.analyserNodeRef.current).toBeNull();
    expect(result.current.permission).toBe('prompt');
    expect(result.current.fft).toEqual(Array.from({ length: 24 }).map(() => 0));
  });

  it('getStream function works correctly', async () => {
    const { result } = renderHook(() =>
      useEncoding({ encodingConstraints: {} }),
    );
    const permissionStatus = await result.current.getStream();
    expect(['granted', 'denied']).toContain(permissionStatus);
  });
});
