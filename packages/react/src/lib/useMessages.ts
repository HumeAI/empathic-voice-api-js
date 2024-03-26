import type { JSONErrorMessage, UserInterruptionMessage } from '@humeai/voice';
import {
  type AgentTranscriptMessage,
  type JSONMessage,
  type UserTranscriptMessage,
} from '@humeai/voice';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from './connection-message';
import { keepLastN } from '../utils';

export const useMessages = ({
  sendMessageToParent,
  messageHistoryLimit,
}: {
  sendMessageToParent?: (
    message:
      | UserTranscriptMessage
      | AgentTranscriptMessage
      | UserInterruptionMessage
      | JSONErrorMessage,
  ) => void;
  messageHistoryLimit: number;
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
    /* 
      1. message comes in from the backend
        - if the message IS NOT AgentTranscriptMessage, store in `messages` immediately  
        - if the message is an AgentTranscriptMessage, stored in `voiceMessageMap`
      2. audio clip plays
        - find the AgentTranscriptMessage with a matching ID, and store it in `messages`
        - remove the AgentTranscriptMessage from `voiceMessageMap`
    */
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
        setMessages((prev) => {
          return keepLastN(messageHistoryLimit, prev.concat([message]));
        });
        break;
      case 'user_interruption':
        sendMessageToParent?.(message);
        setMessages((prev) => {
          return keepLastN(messageHistoryLimit, prev.concat([message]));
        });
        break;
      case 'error':
        sendMessageToParent?.(message);
        setMessages((prev) => {
          return keepLastN(messageHistoryLimit, prev.concat([message]));
        });
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
        setMessages((prev) => {
          return keepLastN(
            messageHistoryLimit,
            prev.concat([matchingTranscript]),
          );
        });
        // remove the message from the map to ensure we don't
        // accidentally push it to the messages array more than once
        setVoiceMessageMap((prev) => {
          const newMap = { ...prev };
          delete newMap[id];
          return newMap;
        });
      }
    },
    [voiceMessageMap, sendMessageToParent, messageHistoryLimit],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastVoiceMessage(null);
    setLastUserMessage(null);
    setVoiceMessageMap({});
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
