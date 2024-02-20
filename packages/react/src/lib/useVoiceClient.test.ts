import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useVoiceClient, VoiceReadyState } from './useVoiceClient';

describe('useVoiceClient', () => {
  it('creates a client with the given config', () => {
    const hook = renderHook(() =>
      useVoiceClient({
        onError: () => {},
      }),
    );

    expect(hook.result.current.readyState).toBe(VoiceReadyState.IDLE);
  });
});
