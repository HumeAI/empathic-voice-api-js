import type { JSONErrorMessage, UserInterruptionMessage } from '@humeai/voice';
import {
  type AgentTranscriptMessage,
  type JSONMessage,
  type UserTranscriptMessage,
} from '@humeai/voice';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from './connection-message';

export const useMessages = ({
  sendMessageToParent,
}: {
  sendMessageToParent?: (
    message:
      | UserTranscriptMessage
      | AgentTranscriptMessage
      | UserInterruptionMessage
      | JSONErrorMessage,
  ) => void;
}) => {
  const [voiceMessageMap, setVoiceMessageMap] = useState<
    Record<string, AgentTranscriptMessage>
  >({});

  const [messages, setMessages] = useState<
    Array<
      | AgentTranscriptMessage
      | UserTranscriptMessage
      | ConnectionMessage
      | UserInterruptionMessage
      | JSONErrorMessage
    >
  >([]);

  const [lastVoiceMessage, setLastVoiceMessage] =
    useState<AgentTranscriptMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<UserTranscriptMessage | null>(null);

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

  const onMessage = useCallback((message: JSONMessage) => {
    switch (message.type) {
      case 'assistant_message':
        // for assistant messages, `sendMessageToParent` is called in `onPlayAudio`
        // in order to line up the transcript event with the correct audio clip
        setVoiceMessageMap((prev) => ({
          ...prev,
          [message.id]: message,
        }));
        break;
      case 'user_message':
        sendMessageToParent?.(message);
        setLastUserMessage(message);
        setMessages((prev) => prev.concat([message]));
        break;
      case 'user_interruption':
        sendMessageToParent?.(message);
        setMessages((prev) => prev.concat([message]));
        break;
      case 'error':
        sendMessageToParent?.(message);
        setMessages((prev) => prev.concat([message]));
        break;
      default:
        break;
    }
  }, []);

  const onPlayAudio = useCallback(
    (id: string) => {
      const matchingTranscript = voiceMessageMap[id];
      if (matchingTranscript) {
        sendMessageToParent?.(matchingTranscript);
        setLastVoiceMessage(matchingTranscript);
        setMessages((prev) => prev.concat([matchingTranscript]));
        // remove the message from the map to ensure we don't
        // accidentally push it to the messages array more than once
        setVoiceMessageMap((prev) => {
          const newMap = { ...prev };
          delete newMap[id];
          return newMap;
        });
      }
    },
    [voiceMessageMap, sendMessageToParent],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastVoiceMessage(null);
    setLastUserMessage(null);
  }, []);

  return {
    createConnectMessage,
    createDisconnectMessage,
    onMessage,
    onPlayAudio,
    clearMessages,
    messages,
    lastVoiceMessage,
    lastUserMessage,
  };
};
