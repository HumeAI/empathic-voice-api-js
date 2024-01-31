import type { Config, TranscriptMessage } from '@humeai/assistant';
import { AssistantClient } from '@humeai/assistant';
import { useCallback, useRef, useState } from 'react';

export enum ReadyState {
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

  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.IDLE);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const onAudioMessage = useRef<
    ((arrayBuffer: ArrayBufferLike) => void) | undefined
  >(props.onAudioMessage);
  onAudioMessage.current = props.onAudioMessage;

  const connect = (config: Config) => {
    return new Promise((resolve, reject) => {
      client.current = AssistantClient.create(config);

      client.current.on('open', () => {
        setReadyState(ReadyState.OPEN);
        console.log('connected websocket');
        resolve(ReadyState.OPEN);
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
        setReadyState(ReadyState.CLOSED);
      });

      client.current.on('error', (e) => {
        const message = e instanceof Error ? e.message : 'Unknown error';
        props.onError(`Error with websocket connection: ${message}`);
        reject(e);
      });

      setReadyState(ReadyState.CONNECTING);

      client.current.connect();
    });
  };

  const disconnect = () => {
    setMessages([]);
    setReadyState(ReadyState.IDLE);
    client.current?.disconnect();
  };

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
