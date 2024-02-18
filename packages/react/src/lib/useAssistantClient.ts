import type { Config, TranscriptMessage } from '@humeai/assistant';
import { AssistantClient } from '@humeai/assistant';
import { useCallback, useRef, useState } from 'react';

export enum AssistantReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export type ConnectionMessage =
  | {
      type: 'socket_connected';
      receivedAt: Date;
    }
  | {
      type: 'socket_disconnected';
      receivedAt: Date;
    };

export const useAssistantClient = (props: {
  onAudioMessage?: (arrayBuffer: ArrayBufferLike) => void;
  onTranscriptMessage?: (message: TranscriptMessage) => void;
  onError?: (message: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const client = useRef<AssistantClient | null>(null);

  const [readyState, setReadyState] = useState<AssistantReadyState>(
    AssistantReadyState.IDLE,
  );
  const [messages, setMessages] = useState<
    (TranscriptMessage | ConnectionMessage)[]
  >([]);
  const [lastAssistantMessage, setLastAssistantMessage] =
    useState<TranscriptMessage | null>(null);
  const [lastUserMessage, setLastUserMessage] =
    useState<TranscriptMessage | null>(null);

  // this pattern might look hacky but it allows us to use the latest props
  // in callbacks set up inside useEffect without re-rendering the useEffect
  const onAudioMessage = useRef<typeof props.onAudioMessage>(
    props.onAudioMessage,
  );
  onAudioMessage.current = props.onAudioMessage;

  const onTranscriptMessage = useRef<typeof props.onTranscriptMessage>(
    props.onTranscriptMessage,
  );
  onTranscriptMessage.current = props.onTranscriptMessage;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const onOpen = useRef<typeof props.onOpen>(props.onOpen);
  onOpen.current = props.onOpen;

  const onClose = useRef<typeof props.onClose>(props.onClose);
  onClose.current = props.onClose;

  const connect = useCallback((config: Config) => {
    return new Promise((resolve, reject) => {
      client.current = AssistantClient.create(config);

      client.current.on('open', () => {
        onOpen.current?.();
        setReadyState(AssistantReadyState.OPEN);
        resolve(AssistantReadyState.OPEN);
        setMessages((prev) =>
          prev.concat([
            {
              type: 'socket_connected',
              receivedAt: new Date(),
            },
          ]),
        );
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
        onClose.current?.();
        setReadyState(AssistantReadyState.CLOSED);
        setMessages((prev) =>
          prev.concat([
            {
              type: 'socket_disconnected',
              receivedAt: new Date(),
            },
          ]),
        );
      });

      client.current.on('error', (e) => {
        const message = e instanceof Error ? e.message : 'Unknown error';
        onError.current?.(message);
        reject(e);
      });

      setReadyState(AssistantReadyState.CONNECTING);

      client.current.connect();
    });
  }, []);

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
