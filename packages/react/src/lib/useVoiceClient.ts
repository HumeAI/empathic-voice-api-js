import type {
  AudioOutputMessage,
  Config,
  TranscriptMessage,
  UserInterruptionMessage,
} from '@humeai/voice';
import { VoiceClient } from '@humeai/voice';
import { useCallback, useRef, useState } from 'react';

export enum VoiceReadyState {
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

export const useVoiceClient = (props: {
  onAudioMessage?: (message: AudioOutputMessage) => void;
  onTranscriptMessage?: (message: TranscriptMessage) => void;
  onUserInterruption?: (message: UserInterruptionMessage) => void;
  onError?: (message: string, error?: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const client = useRef<VoiceClient | null>(null);

  const [readyState, setReadyState] = useState<VoiceReadyState>(
    VoiceReadyState.IDLE,
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

  const onUserInterruption = useRef<typeof props.onUserInterruption>(
    props.onUserInterruption,
  );
  onUserInterruption.current = props.onUserInterruption;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const onOpen = useRef<typeof props.onOpen>(props.onOpen);
  onOpen.current = props.onOpen;

  const onClose = useRef<typeof props.onClose>(props.onClose);
  onClose.current = props.onClose;

  const connect = useCallback((config: Config) => {
    return new Promise((resolve, reject) => {
      client.current = VoiceClient.create(config);

      client.current.on('open', () => {
        onOpen.current?.();
        setReadyState(VoiceReadyState.OPEN);
        resolve(VoiceReadyState.OPEN);
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

        if (message.type === 'user_interruption') {
          onUserInterruption.current?.(message);
        }
      });

      client.current.on('close', () => {
        onClose.current?.();
        setReadyState(VoiceReadyState.CLOSED);
      });

      client.current.on('error', (e) => {
        const message = e instanceof Error ? e.message : 'Unknown error';
        onError.current?.(message, e instanceof Error ? e : undefined);
        reject(e);
      });

      setReadyState(VoiceReadyState.CONNECTING);

      client.current.connect();
    });
  }, []);

  const disconnect = useCallback(() => {
    setReadyState(VoiceReadyState.IDLE);
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
