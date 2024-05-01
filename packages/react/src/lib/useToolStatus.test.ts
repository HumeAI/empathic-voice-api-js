import type { ToolCall, ToolResponse } from '@humeai/voice';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useToolStatus } from './useToolStatus';

describe('useToolStatus', () => {
  it('adds tools to the store', () => {
    const hook = renderHook(() => useToolStatus());

    const toolId = 'tool-id-abc-123';

    const toolCall: ToolCall = {
      type: 'tool_call',
      tool_call_id: toolId,
      name: 'tool_name',
      parameters: '{}',
      receivedAt: new Date(),
      tool_type: 'function',
      response_required: true,
    } satisfies ToolCall;

    act(() => {
      hook.result.current.addToStore(toolCall);
    });

    expect(hook.result.current.store[toolId]?.call).toMatchObject(toolCall);
    expect(hook.result.current.store[toolId]?.resolved).toBeUndefined();

    const toolResponse: ToolResponse = {
      type: 'tool_response',
      tool_call_id: toolId,
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
