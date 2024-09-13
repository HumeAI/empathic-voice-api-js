import { Hume, HumeClient } from 'hume';
import { useCallback, useRef, useState } from 'react';
import { type Simplify } from 'type-fest';

import { type AuthStrategy } from './auth';
import type {
  AudioOutputMessage,
  JSONMessage,
  ToolCall,
} from '../models/messages';

const isNever = (_n: never) => {
  return;
};

export type SocketConfig = {
  auth: AuthStrategy;
  hostname?: string;
} & Hume.empathicVoice.chat.Chat.ConnectArgs;

export enum VoiceReadyState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
}

export type ToolCallHandler = (
  // message will always be a tool call message where toolType === 'function'
  message: Simplify<
    ToolCall & {
      // caveat: this doesn't actually do what it appears to, since ToolType is
      // exported as both an interface and a value, this ends up being a constant
      // that doesn't share an type identity with the actual ToolType enum
      toolType: typeof Hume.empathicVoice.ToolType.Function;
    }
  >,
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
  onAudioMessage?: (message: AudioOutputMessage) => void;
  onMessage?: (message: JSONMessage) => void;
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

  const connect = useCallback((config: SocketConfig) => {
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
          const messageWithReceivedAt = { ...message, receivedAt: new Date() };
          onAudioMessage.current?.(messageWithReceivedAt);
          return;
        }

        if (
          message.type === 'assistant_message' ||
          message.type === 'user_message' ||
          message.type === 'user_interruption' ||
          message.type === 'error' ||
          message.type === 'tool_response' ||
          message.type === 'tool_error' ||
          message.type === 'chat_metadata' ||
          message.type === 'assistant_end'
        ) {
          const messageWithReceivedAt = { ...message, receivedAt: new Date() };
          onMessage.current?.(messageWithReceivedAt);
          return;
        }

        if (message.type === 'tool_call') {
          const messageWithReceivedAt = { ...message, receivedAt: new Date() };
          onMessage.current?.(messageWithReceivedAt);

          // only pass tool call messages for user defined tools
          if (message.toolType === Hume.empathicVoice.ToolType.Function) {
            void onToolCall
              .current?.(
                {
                  ...messageWithReceivedAt,
                  // we have to do this because even though we are using the correct
                  // enum on line 30 for the type definition
                  // fern exports an interface and a value using the same `ToolType`
                  // identifier so the type comparisons will always fail
                  toolType: 'function',
                },
                {
                  success: (content: unknown) => ({
                    type: 'tool_response',
                    toolCallId: messageWithReceivedAt.toolCallId,
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
                    toolCallId: messageWithReceivedAt.toolCallId,
                    error,
                    code,
                    level: level !== null ? 'warn' : undefined, // level can only be warn
                    content,
                  }),
                },
              )
              .then((response) => {
                // if valid send it to the socket
                // otherwise, report error
                if (response.type === 'tool_response') {
                  client.current?.sendToolResponseMessage(response);
                } else if (response.type === 'tool_error') {
                  client.current?.sendToolErrorMessage(response);
                } else {
                  onError.current?.('Invalid response from tool call');
                }
              });
          }
          return;
        }

        // asserts that all message types are handled
        isNever(message);
        return;
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
      if (readyState !== VoiceReadyState.OPEN) {
        throw new Error('Socket is not open');
      }
      client.current?.sendSessionSettings(sessionSettings);
    },
    [readyState],
  );

  const sendAudio = useCallback(
    (arrayBuffer: ArrayBufferLike) => {
      if (readyState !== VoiceReadyState.OPEN) {
        throw new Error('Socket is not open');
      }
      client.current?.socket?.send(arrayBuffer);
    },
    [readyState],
  );

  const sendUserInput = useCallback(
    (text: string) => {
      if (readyState !== VoiceReadyState.OPEN) {
        throw new Error('Socket is not open');
      }
      client.current?.sendUserInput(text);
    },
    [readyState],
  );

  const sendAssistantInput = useCallback(
    (text: string) => {
      if (readyState !== VoiceReadyState.OPEN) {
        throw new Error('Socket is not open');
      }
      client.current?.sendAssistantInput({
        text,
      });
    },
    [readyState],
  );

  const sendToolMessage = useCallback(
    (
      // type definitions for toolMessage come from the Hume SDK because messages that are sent from the client
      // to the backend do not have the extended `receivedAt` field
      toolMessage:
        | Hume.empathicVoice.ToolResponseMessage
        | Hume.empathicVoice.ToolErrorMessage,
    ) => {
      if (readyState !== VoiceReadyState.OPEN) {
        throw new Error('Socket is not open');
      }
      if (toolMessage.type === 'tool_error') {
        client.current?.sendToolErrorMessage(toolMessage);
      } else {
        client.current?.sendToolResponseMessage(toolMessage);
      }
    },
    [readyState],
  );

  const sendPauseAssistantMessage = useCallback(() => {
    if (readyState !== VoiceReadyState.OPEN) {
      throw new Error('Socket is not open');
    }
    client.current?.pauseAssistant({});
  }, [readyState]);
  const sendResumeAssistantMessage = useCallback(() => {
    if (readyState !== VoiceReadyState.OPEN) {
      throw new Error('Socket is not open');
    }
    client.current?.resumeAssistant({});
  }, [readyState]);

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
