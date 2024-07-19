import { type Hume } from 'hume';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from './connection-message';
import { keepLastN } from '../utils';

export const useMessages = ({
  sendMessageToParent,
  messageHistoryLimit,
}: {
  sendMessageToParent?: (
    message: Hume.empathicVoice.JsonMessage & { receivedAt: Date },
  ) => void;
  messageHistoryLimit: number;
}) => {
  const [voiceMessageMap, setVoiceMessageMap] = useState<
    Record<string, Hume.empathicVoice.AssistantMessage & { receivedAt: Date }>
  >({});

  const [messages, setMessages] = useState<
    Array<
      | (Hume.empathicVoice.JsonMessage & { receivedAt: Date })
      | ConnectionMessage
    >
  >([]);

  const [lastVoiceMessage, setLastVoiceMessage] =
    useState<Hume.empathicVoice.AssistantMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<Hume.empathicVoice.UserMessage | null>(null);

  const [chatMetadata, setChatMetadata] =
    useState<Hume.empathicVoice.ChatMetadata | null>(null);

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

  const onMessage = useCallback(
    (message: Hume.empathicVoice.JsonMessage & { receivedAt: Date }) => {
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
          setLastUserMessage(message);
          setMessages((prev) => {
            return keepLastN(messageHistoryLimit, prev.concat([message]));
          });
          break;
        case 'user_interruption':
        case 'error':
        case 'tool_call':
        case 'tool_response':
        case 'tool_error':
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
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
    chatMetadata,
  };
};
