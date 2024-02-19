import type { TranscriptMessage } from '@humeai/assistant';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from '..';

export const useMessages = () => {
  const [assistantMessageMap, setAssistantMessageMap] = useState<
    Record<string, TranscriptMessage>
  >({});
  const [messages, setMessages] = useState<
    (TranscriptMessage | ConnectionMessage)[]
  >([]);
  const [lastAssistantMessage, setLastAssistantMessage] =
    useState<TranscriptMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<TranscriptMessage | null>(null);

  const createConnectMessage = useCallback(() => {
    setMessages((prev) =>
      prev.concat([
        {
          type: 'socket_connected',
          receivedAt: new Date(),
        },
      ]),
    );
  }, []);

  const createDisconnectMessage = useCallback(() => {
    setMessages((prev) =>
      prev.concat([
        {
          type: 'socket_disconnected',
          receivedAt: new Date(),
        },
      ]),
    );
  }, []);

  const onTranscriptMessage = useCallback((message: TranscriptMessage) => {
    if (message.type === 'assistant_message') {
      setAssistantMessageMap((prev) => ({
        ...prev,
        [message.id]: message,
      }));
    } else if (message.type === 'user_message') {
      setLastUserMessage(message);
      setMessages((prev) => prev.concat([message]));
    }
  }, []);

  const onPlayAudio = useCallback(
    (id: string) => {
      const matchingTranscript = assistantMessageMap[id];
      if (matchingTranscript) {
        setLastAssistantMessage(matchingTranscript);
        setMessages((prev) => prev.concat([matchingTranscript]));
        // remove the message from the map to ensure we don't
        // accidentally push it to the messages array more than once
        setAssistantMessageMap((prev) => {
          const newMap = { ...prev };
          delete newMap[id];
          return newMap;
        });
      }
    },
    [assistantMessageMap],
  );

  const disconnect = useCallback(() => {
    setMessages([]);
    setLastAssistantMessage(null);
    setLastUserMessage(null);
  }, []);

  return {
    createConnectMessage,
    createDisconnectMessage,
    onTranscriptMessage,
    onPlayAudio,
    disconnect,
    messages,
    lastAssistantMessage,
    lastUserMessage,
  };
};
