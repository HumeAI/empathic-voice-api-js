import type { Config, TranscriptMessage } from '@humeai/assistant';
import { AssistantClient } from '@humeai/assistant';
import { useCallback, useRef, useState } from 'react';

export enum AssistantReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export const useAssistantClient = (props: {
  onAudioMessage?: (arrayBuffer: ArrayBufferLike) => void;
  onTranscriptMessage?: (message: TranscriptMessage) => void;
  onError: (message: string) => void;
}) => {
  const client = useRef<AssistantClient | null>(null);

  const [readyState, setReadyState] = useState<AssistantReadyState>(
    AssistantReadyState.IDLE,
  );
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [lastAssistantMessage, setLastAssistantMessage] =
    useState<TranscriptMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<TranscriptMessage | null>(null);

  const onAudioMessage = useRef<typeof props.onAudioMessage>(
    props.onAudioMessage,
  );
  onAudioMessage.current = props.onAudioMessage;

  const onTranscriptMessage = useRef<typeof props.onTranscriptMessage>(
    props.onTranscriptMessage,
  );
  onTranscriptMessage.current = props.onTranscriptMessage;

  const connect = useCallback(
    (config: Config) => {
      return new Promise((resolve, reject) => {
        client.current = AssistantClient.create(config);

        client.current.on('open', () => {
          setReadyState(AssistantReadyState.OPEN);
          resolve(AssistantReadyState.OPEN);
        });

        client.current.on('message', (message) => {
          if (message.type === 'audio') {
            onAudioMessage.current?.(message.data);
          }

          if (message.type === 'assistant_message') {
            setLastAssistantMessage(message);
          }

          if (message.type === 'user_message') {
            setLastUserMessage(message);
          }

          if (
            message.type === 'assistant_message' ||
            message.type === 'user_message'
          ) {
            onTranscriptMessage.current?.(message);
            setMessages((prev) => {
              return prev.concat([message]);
            });
          }
        });

        client.current.on('close', () => {
          setReadyState(AssistantReadyState.CLOSED);
        });

        client.current.on('error', (e) => {
          const message = e instanceof Error ? e.message : 'Unknown error';
          props.onError(message);
          reject(e);
        });

        setReadyState(AssistantReadyState.CONNECTING);

        client.current.connect();
      });
    },
    [props],
  );

  const disconnect = useCallback(() => {
    setMessages([]);
    setLastAssistantMessage(null);
    setLastUserMessage(null);
    setReadyState(AssistantReadyState.IDLE);
    client.current?.disconnect();
  }, []);

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    client.current?.sendAudio(arrayBuffer);
  }, []);

  return {
    readyState,
    messages,
    lastAssistantMessage,
    lastUserMessage,
    sendAudio,
    connect,
    disconnect,
  };
};
