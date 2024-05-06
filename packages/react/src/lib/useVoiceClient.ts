import type {
  AssistantTranscriptMessage,
  AudioOutputMessage,
  JSONErrorMessage,
  SessionSettings,
  SocketConfig,
  ToolCall,
  ToolError,
  ToolResponse,
  UserInterruptionMessage,
  UserTranscriptMessage,
  VoiceEventMap,
} from '@humeai/voice';
import {
  ToolErrorSchema,
  ToolResponseSchema,
  VoiceClient,
} from '@humeai/voice';
import { useCallback, useRef, useState } from 'react';
import { z } from 'zod';

export enum VoiceReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export type ToolCallHandler = (
  message: ToolCall,
  send: {
    success: (content: unknown) => ToolResponse;
    error: (e: {
      error: string;
      code: string;
      level: string;
      content: string;
    }) => ToolError;
  },
) => Promise<ToolResponse | ToolError>;

export const useVoiceClient = (props: {
  onAudioMessage?: (message: AudioOutputMessage) => void;
  onMessage?: (
    message:
      | UserTranscriptMessage
      | AssistantTranscriptMessage
      | UserInterruptionMessage
      | JSONErrorMessage
      | ToolCall
      | ToolResponse
      | ToolError,
  ) => void;
  onToolCall?: ToolCallHandler;
  onError?: (message: string, error?: Error) => void;
  onOpen?: () => void;
  onClose?: VoiceEventMap['close'];
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

  const onMessage = useRef<typeof props.onMessage>(props.onMessage);
  onMessage.current = props.onMessage;

  const onToolCall = useRef<typeof props.onToolCall>(props.onToolCall);
  onToolCall.current = props.onToolCall;

  const onError = useRef<typeof props.onError>(props.onError);
  onError.current = props.onError;

  const onOpen = useRef<typeof props.onOpen>(props.onOpen);
  onOpen.current = props.onOpen;

  const onClose = useRef<typeof props.onClose>(props.onClose);
  onClose.current = props.onClose;

  const connect = useCallback((config: SocketConfig) => {
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
          message.type === 'user_message' ||
          message.type === 'user_interruption' ||
          message.type === 'error' ||
          message.type === 'tool_response' ||
          message.type === 'tool_error'
        ) {
          onMessage.current?.(message);
        }

        if (message.type === 'tool_call') {
          onMessage.current?.(message);
          void onToolCall
            .current?.(message, {
              success: (content: unknown) => ({
                type: 'tool_response',
                tool_call_id: message.tool_call_id,
                content: JSON.stringify(content),
              }),
              error: ({
                error,
                code,
                level,
                content,
              }: {
                error: string;
                code: string;
                level: string;
                content: string;
              }) => ({
                type: 'tool_error',
                tool_call_id: message.tool_call_id,
                error,
                code,
                level,
                content,
              }),
            })
            .then((response) => {
              // check that response is a correctly formatted response or error payload
              const parsed = z
                .union([ToolResponseSchema, ToolErrorSchema])
                .safeParse(response);

              // if valid send it to the socket
              // otherwise, report error
              if (parsed.success) {
                client.current?.sendToolMessage(parsed.data);
              } else {
                onError.current?.('Invalid response from tool call');
              }
            });
        }
      });

      client.current.on('close', (event) => {
        onClose.current?.(event);
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

  const sendSessionSettings = useCallback(
    (sessionSettings: SessionSettings) => {
      try {
        client.current?.sendSessionSettings(sessionSettings);
      } catch (e) {
        void true;
      }
    },
    [],
  );

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    try {
      client.current?.sendAudio(arrayBuffer);
    } catch (e) {
      void true;
    }
  }, []);

  const sendUserInput = useCallback((text: string) => {
    try {
      client.current?.sendUserInput(text);
    } catch (e) {
      void true;
    }
  }, []);

  const sendAssistantInput = useCallback((text: string) => {
    try {
      client.current?.sendAssistantInput(text);
    } catch (e) {
      void true;
    }
  }, []);

  const sendToolMessage = useCallback(
    (toolMessage: ToolResponse | ToolError) => {
      try {
        client.current?.sendToolMessage(toolMessage);
      } catch (e) {
        void true;
      }
    },
    [],
  );

  return {
    readyState,
    sendSessionSettings,
    sendAudio,
    connect,
    disconnect,
    sendUserInput,
    sendAssistantInput,
    sendToolMessage,
  };
};
