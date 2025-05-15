import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';

import { useEncoding } from './useEncoding';

describe('useEncoding', () => {
  it('is defined', () => {
    expect(useEncoding).toBeDefined();
  });

  it('getStream function works correctly', async () => {
    const { result } = renderHook(() => useEncoding());
    const permissionStatus = await result.current.getStream();
    expect(['granted', 'denied']).toContain(permissionStatus);
  });
});
