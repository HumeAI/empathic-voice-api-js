import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { VoiceReadyState } from './useVoiceClient';
import { useVoice, VoiceProvider } from './VoiceProvider';

describe('useVoice', () => {
  it('should in', async () => {
    const hook = renderHook(() => useVoice(), {
      wrapper: ({ children }) => {
        return <VoiceProvider>{children}</VoiceProvider>;
      },
    });

    expect(hook.result.current.readyState).toBe(VoiceReadyState.IDLE);
  });
});
