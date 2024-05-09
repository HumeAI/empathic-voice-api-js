import type { ToolCall, ToolError, ToolResponse } from '@humeai/voice';
import { useCallback, useState } from 'react';

export const useToolStatus = () => {
  const [store, setStore] = useState<
    Record<string, { call?: ToolCall; resolved?: ToolResponse | ToolError }>
  >({});

  const addToStore = useCallback(
    (message: ToolCall | ToolResponse | ToolError) => {
      setStore((prev) => {
        const entry = {
          ...prev[message.tool_call_id],
        };

        if (message.type === 'tool_call') {
          entry.call = message;
        }

        if (message.type === 'tool_response' || message.type === 'tool_error') {
          entry.resolved = message;
        }

        return {
          ...prev,
          [message.tool_call_id]: entry,
        };
      });
    },
    [],
  );

  const clearStore = useCallback(() => {
    setStore({});
  }, []);

  return {
    store,
    addToStore,
    clearStore,
  };
};
