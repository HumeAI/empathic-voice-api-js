import type {
  AudioOutputMessage,
  Config,
  TranscriptMessage,
} from '@humeai/assistant';
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
  onAudioMessage?: (message: AudioOutputMessage) => void;
  onTranscriptMessage?: (message: TranscriptMessage) => void;
  onError?: (message: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const client = useRef<AssistantClient | null>(null);

  const [readyState, setReadyState] = useState<AssistantReadyState>(
    AssistantReadyState.IDLE,
  );

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
      });

      client.current.on('message', (message) => {
        if (message.type === 'audio_output') {
          onAudioMessage.current?.(message);
        }

        if (
          message.type === 'assistant_message' ||
          message.type === 'user_message'
        ) {
          onTranscriptMessage.current?.(message);
        }
      });

      client.current.on('close', () => {
        onClose.current?.();
        setReadyState(AssistantReadyState.CLOSED);
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
    setReadyState(AssistantReadyState.IDLE);
    client.current?.disconnect();
  }, []);

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    client.current?.sendAudio(arrayBuffer);
  }, []);

  return {
    readyState,
    sendAudio,
    connect,
    disconnect,
  };
};
