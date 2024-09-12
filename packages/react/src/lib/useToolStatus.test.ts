import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useToolStatus } from './useToolStatus';

describe('useToolStatus', () => {
  it('adds tools to the store', () => {
    const hook = renderHook(() => useToolStatus());

    const toolId = 'tool-id-abc-123';

    const toolCall = {
      type: 'tool_call' as const,
      toolCallId: toolId,
      name: 'tool_name',
      parameters: '{}',
      toolType: 'function' as const,
      responseRequired: true,
      receivedAt: new Date(1),
    };

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      hook.result.current.addToStore(toolCall);
    });

    expect(hook.result.current.store[toolId]?.call).toMatchObject(toolCall);
    expect(hook.result.current.store[toolId]?.resolved).toBeUndefined();

    const toolResponse = {
      type: 'tool_response' as const,
      toolCallId: toolId,
      content: '',
      receivedAt: new Date(1),
    };

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      hook.result.current.addToStore(toolResponse);
    });

    expect(hook.result.current.store[toolId]?.resolved).toMatchObject(
      toolResponse,
    );
  });
});
