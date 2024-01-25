import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReadyState, useAssistantClient } from './useAssistantClient';

describe('useAssistantClient', () => {
  it('creates a client with the given config', () => {
    const hook = renderHook(() =>
      useAssistantClient({
        config: {
          apiKey: '',
          hostname: '',
          reconnectAttempts: 0,
          debug: false,
        },
        onError: (_e: Error) => {},
      }),
    );

    expect(hook.result.current.readyState).toBe(ReadyState.IDLE);
  });
});
