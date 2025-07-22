import type { CloseEvent } from 'hume/core';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from './connection-message';
import type {
  AssistantProsodyMessage,
  AssistantTranscriptMessage,
  ChatMetadataMessage,
  JSONMessage,
  UserTranscriptMessage,
} from '../models/messages';
import { keepLastN } from '../utils';

export const useMessages = ({
  sendMessageToParent,
  messageHistoryLimit,
}: {
  sendMessageToParent?: (message: JSONMessage) => void;
  messageHistoryLimit: number;
}) => {
  const [voiceMessageMap, setVoiceMessageMap] = useState<
    Record<string, AssistantTranscriptMessage>
  >({});

  const [messages, setMessages] = useState<
    Array<JSONMessage | ConnectionMessage>
  >([]);

  const [lastVoiceMessage, setLastVoiceMessage] =
    useState<AssistantTranscriptMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<UserTranscriptMessage | null>(null);
  const [lastAssistantProsodyMessage, setLastAssistantProsodyMessage] =
    useState<AssistantProsodyMessage | null>(null);

  const [chatMetadata, setChatMetadata] = useState<ChatMetadataMessage | null>(
    null,
  );

  const createConnectMessage = useCallback(() => {
    setChatMetadata(null);
    setMessages((prev) =>
      prev.concat([
        {
          type: 'socket_connected',
          receivedAt: new Date(),
        },
      ]),
    );
  }, []);

  const createDisconnectMessage = useCallback((event: CloseEvent) => {
    setMessages((prev) =>
      prev.concat([
        {
          type: 'socket_disconnected',
          code: event.code,
          reason: event.reason,
          receivedAt: new Date(),
        },
      ]),
    );
  }, []);

  const onMessage = useCallback(
    (message: JSONMessage) => {
      /* 
      1. message comes in from the backend
        - if the message IS NOT AssistantTranscriptMessage, store in `messages` immediately  
        - if the message is an AssistantTranscriptMessage, stored in `voiceMessageMap`
      2. audio clip plays
        - find the AssistantTranscriptMessage with a matching ID, and store it in `messages`
        - remove the AssistantTranscriptMessage from `voiceMessageMap`
    */
      switch (message.type) {
        case 'assistant_message':
          // for assistant messages, `sendMessageToParent` is called in `onPlayAudio`
          // in order to line up the transcript event with the correct audio clip
          setVoiceMessageMap((prev) => ({
            ...prev,
            [`${message.id}`]: message,
          }));
          break;
        case 'user_message':
          sendMessageToParent?.(message);

          if (message.interim === false) {
            setLastUserMessage(message);
          }

          setMessages((prev) => {
            if (prev.length === 0) {
              return keepLastN(messageHistoryLimit, [message]);
            }
            let mostRecentUserMessage: UserTranscriptMessage | undefined;
            let mostRecentUserMessageIndex: number | undefined;
            for (let i = prev.length - 1; i >= 0; i--) {
              const m = prev[i];
              if (m && m.type === 'user_message') {
                mostRecentUserMessage = m;
                mostRecentUserMessageIndex = i;
                break;
              }
            }
            if (mostRecentUserMessage?.interim === true) {
              const nextMessages = prev.map((m, idx) => {
                if (idx === mostRecentUserMessageIndex) {
                  return message;
                }
                return m;
              });
              return keepLastN(messageHistoryLimit, nextMessages);
            }
            return keepLastN(messageHistoryLimit, prev.concat([message]));
          });

          break;
        case 'user_interruption':
        case 'error':
        case 'tool_call':
        case 'tool_response':
        case 'tool_error':
        case 'assistant_end':
          sendMessageToParent?.(message);
          setMessages((prev) => {
            return keepLastN(messageHistoryLimit, prev.concat([message]));
          });
          break;
        case 'assistant_prosody':
          setLastAssistantProsodyMessage(message);
          sendMessageToParent?.(message);
          setMessages((prev) => {
            return keepLastN(messageHistoryLimit, prev.concat([message]));
          });
          break;
        case 'chat_metadata':
          sendMessageToParent?.(message);
          setMessages((prev) => {
            return keepLastN(messageHistoryLimit, prev.concat([message]));
          });
          setChatMetadata(message);
          break;
        default:
          break;
      }
    },
    [messageHistoryLimit, sendMessageToParent],
  );

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
    setLastAssistantProsodyMessage(null);
    setVoiceMessageMap({});
    setChatMetadata(null);
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
    lastAssistantProsodyMessage,
    chatMetadata,
  };
};
