import type { Config, Message } from '@humeai/assistant';
import { AssistantClient } from '@humeai/assistant';
import { useCallback, useEffect, useRef, useState } from 'react';

export enum ReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export const useAssistantClient = (props: {
  config: Config;
  onAudioMessage?: (arrayBuffer: ArrayBufferLike) => void;
}) => {
  const config = useRef<Config>(props.config);
  config.current = props.config;

  const client = useRef<AssistantClient | null>(null);

  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.OPEN);
  const [messages, setMessages] = useState<Message[]>([]);

  const onAudioMessage = useRef<
    ((arrayBuffer: ArrayBufferLike) => void) | undefined
  >(props.onAudioMessage);
  onAudioMessage.current = props.onAudioMessage;

  useEffect(() => {
    client.current = AssistantClient.create(config.current);

    client.current.on('open', () => {
      setReadyState(ReadyState.OPEN);
    });

    client.current.on('message', (message) => {
      if (message.type === 'audio') {
        onAudioMessage.current?.(message.data);
      }

      setMessages((prev) => {
        return prev.concat([message]);
      });
    });

    client.current.on('close', () => {
      setReadyState(ReadyState.CLOSED);
    });

    client.current.on('error', () => {});

    setReadyState(ReadyState.CONNECTING);

    client.current.connect();

    return () => {
      client.current?.disconnect();
    };
  }, []);

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    client.current?.sendAudio(arrayBuffer);
  }, []);

  return {
    readyState,
    messages,
    sendAudio,
  };
};
