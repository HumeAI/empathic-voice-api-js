import type { Hume } from 'hume';
import { useCallback, useState } from 'react';

export const useToolStatus = () => {
  const [store, setStore] = useState<
    Record<
      string,
      {
        call?: Hume.empathicVoice.ToolCallMessage;
        resolved?:
          | Hume.empathicVoice.ToolResponseMessage
          | Hume.empathicVoice.ToolErrorMessage;
      }
    >
  >({});

  const addToStore = useCallback(
    (
      message:
        | Hume.empathicVoice.ToolCallMessage
        | Hume.empathicVoice.ToolResponseMessage
        | Hume.empathicVoice.ToolErrorMessage,
    ) => {
      setStore((prev) => {
        const entry = {
          ...prev[message.toolCallId],
        };

        if (message.type === 'tool_call') {
          entry.call = message;
        }

        if (message.type === 'tool_response' || message.type === 'tool_error') {
          entry.resolved = message;
        }

        return {
          ...prev,
          [message.toolCallId]: entry,
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
