import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReadyState, useAssistantClient } from './useAssistantClient';

describe('useAssistantClient', () => {
  it('creates a client with the given config', () => {
    const hook = renderHook(() =>
      useAssistantClient({
        onError: () => {},
      }),
    );

    expect(hook.result.current.readyState).toBe(ReadyState.IDLE);
  });
});
