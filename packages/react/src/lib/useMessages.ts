import type { TranscriptMessage } from '@humeai/voice';
import { useCallback, useState } from 'react';

import type { ConnectionMessage } from '..';

export const useMessages = () => {
  const [voiceMessageMap, setVoiceMessageMap] = useState<
    Record<string, TranscriptMessage>
  >({});
  const [messages, setMessages] = useState<
    (TranscriptMessage | ConnectionMessage)[]
  >([]);
  const [lastVoiceMessage, setLastVoiceMessage] =
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
      setVoiceMessageMap((prev) => ({
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
      const matchingTranscript = voiceMessageMap[id];
      if (matchingTranscript) {
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
    [voiceMessageMap],
  );

  const disconnect = useCallback(() => {
    setMessages([]);
    setLastVoiceMessage(null);
    setLastUserMessage(null);
  }, []);

  return {
    createConnectMessage,
    createDisconnectMessage,
    onTranscriptMessage,
    onPlayAudio,
    disconnect,
    messages,
    lastVoiceMessage,
    lastUserMessage,
  };
};
