import { type Hume, HumeClient } from 'hume';
import * as serializers from 'hume/serialization';
import { useCallback, useRef, useState } from 'react';

import { type AuthStrategy } from './auth';

export type SockeConfig = {
  auth: AuthStrategy;
  hostname: string;
} & Hume.empathicVoice.chat.Chat.ConnectArgs;

export enum VoiceReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export type ToolCallHandler = (
  message: Hume.empathicVoice.ToolCallMessage,
  send: {
    success: (content: unknown) => Hume.empathicVoice.ToolResponseMessage;
    error: (e: {
      error: string;
      code: string;
      level: string;
      content: string;
    }) => Hume.empathicVoice.ToolErrorMessage;
  },
) => Promise<
  Hume.empathicVoice.ToolResponseMessage | Hume.empathicVoice.ToolErrorMessage
>;

export const useVoiceClient = (props: {
  onAudioMessage?: (message: Hume.empathicVoice.AudioOutput) => void;
  onMessage?: (
    message:
      | Hume.empathicVoice.UserMessage
      | Hume.empathicVoice.AssistantMessage
      | Hume.empathicVoice.UserInterruption
      | Hume.empathicVoice.WebSocketError
      | Hume.empathicVoice.ToolCallMessage
      | Hume.empathicVoice.ToolResponseMessage
      | Hume.empathicVoice.ToolErrorMessage
      | Hume.empathicVoice.ChatMetadata,
  ) => void;
  onToolCall?: ToolCallHandler;
  onError?: (message: string, error?: Error) => void;
  onOpen?: () => void;
  onClose?: Hume.empathicVoice.chat.ChatSocket.EventHandlers['close'];
}) => {
  const client = useRef<Hume.empathicVoice.chat.ChatSocket | null>(null);

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

  const connect = useCallback((config: SockeConfig) => {
    return new Promise((resolve, reject) => {
      const hume = new HumeClient(
        config.auth.type === 'apiKey'
          ? {
              apiKey: config.auth.value,
              environment: config.hostname,
            }
          : {
              accessToken: config.auth.value,
              environment: config.hostname,
            },
      );

      client.current = hume.empathicVoice.chat.connect(config);

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
          message.type === 'tool_error' ||
          message.type === 'chat_metadata'
        ) {
          onMessage.current?.(message);
        }

        if (message.type === 'tool_call') {
          onMessage.current?.(message);
          void onToolCall
            .current?.(message, {
              success: (content: unknown) => ({
                type: 'tool_response',
                toolCallId: message.toolCallId,
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
                toolCallId: message.toolCallId,
                error,
                code,
                level: level != null ? 'warn' : undefined, // level can only be warn
                content,
              }),
            })
            .then((response) => {
              // check that response is a correctly formatted response or error payload
              const parsedResponse =
                serializers.empathicVoice.ToolResponseMessage.parse(response);
              const parsedError =
                serializers.empathicVoice.ToolErrorMessage.parse(response);

              // if valid send it to the socket
              // otherwise, report error
              if (response.type === 'tool_response' && parsedResponse.ok) {
                client.current?.sendToolResponseMessage(response);
              } else if (response.type === 'tool_error' && parsedError.ok) {
                client.current?.sendToolErrorMessage(response);
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
    });
  }, []);

  const disconnect = useCallback(() => {
    setReadyState(VoiceReadyState.IDLE);
    client.current?.close();
  }, []);

  const sendSessionSettings = useCallback(
    (sessionSettings: Hume.empathicVoice.SessionSettings) => {
      client.current?.sendSessionSettings(sessionSettings);
    },
    [],
  );

  const sendAudio = useCallback((arrayBuffer: ArrayBufferLike) => {
    client.current?.socket?.send(arrayBuffer);
  }, []);

  const sendUserInput = useCallback((text: string) => {
    client.current?.sendUserInput(text);
  }, []);

  const sendAssistantInput = useCallback((text: string) => {
    client.current?.sendAssistantInput({
      text,
    });
  }, []);

  const sendToolMessage = useCallback(
    (
      toolMessage:
        | Hume.empathicVoice.ToolResponseMessage
        | Hume.empathicVoice.ToolErrorMessage,
    ) => {
      if (toolMessage.type === 'tool_error') {
        client.current?.sendToolErrorMessage(toolMessage);
      } else {
        client.current?.sendToolResponseMessage(toolMessage);
      }
    },
    [],
  );

  const sendPauseAssistantMessage = useCallback(() => {
    client.current?.pauseAssistant({});
  }, []);
  const sendResumeAssistantMessage = useCallback(() => {
    client.current?.resumeAssistant({});
  }, []);

  return {
    readyState,
    sendSessionSettings,
    sendAudio,
    connect,
    disconnect,
    sendUserInput,
    sendAssistantInput,
    sendToolMessage,
    sendPauseAssistantMessage,
    sendResumeAssistantMessage,
  };
};
