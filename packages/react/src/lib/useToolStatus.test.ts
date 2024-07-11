import { act, renderHook } from '@testing-library/react';
import type { Hume } from 'Hume';
import { describe, expect, it } from 'vitest';

import { useToolStatus } from './useToolStatus';

describe('useToolStatus', () => {
  it('adds tools to the store', () => {
    const hook = renderHook(() => useToolStatus());

    const toolId = 'tool-id-abc-123';

    const toolCall: Hume.empathicVoice.ToolCallMessage = {
      type: 'tool_call',
      toolCallId: toolId,
      name: 'tool_name',
      parameters: '{}',
      toolType: 'function',
      responseRequired: true,
    };

    act(() => {
      hook.result.current.addToStore(toolCall);
    });

    expect(hook.result.current.store[toolId]?.call).toMatchObject(toolCall);
    expect(hook.result.current.store[toolId]?.resolved).toBeUndefined();

    const toolResponse: Hume.empathicVoice.ToolResponseMessage = {
      type: 'tool_response',
      toolCallId: toolId,
      content: '',
    };

    act(() => {
      hook.result.current.addToStore(toolResponse);
    });

    expect(hook.result.current.store[toolId]?.resolved).toMatchObject(
      toolResponse,
    );
  });
});
