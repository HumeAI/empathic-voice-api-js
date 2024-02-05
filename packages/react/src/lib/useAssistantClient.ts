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
  onError: (message: string) => void;
}) => {
  const client = useRef<AssistantClient | null>(null);

  const [readyState, setReadyState] = useState<AssistantReadyState>(
    AssistantReadyState.IDLE,
  );
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const onAudioMessage = useRef<
    ((arrayBuffer: ArrayBufferLike) => void) | undefined
  >(props.onAudioMessage);
  onAudioMessage.current = props.onAudioMessage;

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

          if (
            message.type === 'assistant_message' ||
            message.type === 'user_message'
          ) {
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
          props.onError(`Error with websocket connection: ${message}`);
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
    setReadyState(AssistantReadyState.IDLE);
    client.current?.disconnect();
  }, []);

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    client.current?.sendAudio(arrayBuffer);
  }, []);

  return {
    readyState,
    messages,
    sendAudio,
    connect,
    disconnect,
  };
};
