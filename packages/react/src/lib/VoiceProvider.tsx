import { type Hume } from 'hume';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ConnectionMessage } from './connection-message';
import { noop } from './noop';
import { useCallDuration } from './useCallDuration';
import { useEncoding } from './useEncoding';
import { useMessages } from './useMessages';
import { useMicrophone } from './useMicrophone';
import { useSoundPlayer } from './useSoundPlayer';
import { useToolStatus } from './useToolStatus';
import {
  SocketConfig,
  ToolCallHandler,
  useVoiceClient,
  VoiceReadyState,
} from './useVoiceClient';
import { ConnectOptions } from '../models/connect-options';
import {
  AssistantTranscriptMessage,
  AudioOutputMessage,
  ChatMetadataMessage,
  JSONMessage,
  UserInterruptionMessage,
  UserTranscriptMessage,
} from '../models/messages';

type VoiceError =
  | { type: 'socket_error'; message: string; error?: Error }
  | { type: 'audio_error'; message: string; error?: Error }
  | { type: 'mic_error'; message: string; error?: Error };

type VoiceStatus =
  | {
      value: 'disconnected' | 'connecting' | 'connected';
      reason?: never;
    }
  | {
      value: 'error';
      reason: string;
    };

export type VoiceContextType = {
  connect: (options?: ConnectOptions) => Promise<void>;
  disconnect: () => void;
  fft: number[];
  isMuted: boolean;
  isAudioMuted: boolean;
  isPlaying: boolean;
  isReconnecting: boolean;
  messages: (JSONMessage | ConnectionMessage)[];
  lastVoiceMessage: AssistantTranscriptMessage | null;
  lastUserMessage: UserTranscriptMessage | null;
  clearMessages: () => void;
  mute: () => void;
  unmute: () => void;
  muteAudio: () => void;
  unmuteAudio: () => void;
  readyState: VoiceReadyState;
  sendUserInput: (text: string) => void;
  sendAssistantInput: (text: string) => void;
  sendSessionSettings: Hume.empathicVoice.chat.ChatSocket['sendSessionSettings'];
  sendToolMessage: (
    type:
      | Hume.empathicVoice.ToolResponseMessage
      | Hume.empathicVoice.ToolErrorMessage,
  ) => void;
  pauseAssistant: () => void;
  resumeAssistant: () => void;
  status: VoiceStatus;
  micFft: number[];
  error: VoiceError | null;
  isAudioError: boolean;
  isError: boolean;
  isMicrophoneError: boolean;
  isSocketError: boolean;
  callDurationTimestamp: string | null;
  toolStatusStore: ReturnType<typeof useToolStatus>['store'];
  chatMetadata: ChatMetadataMessage | null;
  playerQueueLength: number;
  isPaused: boolean;
  volume: number;
  setVolume: (level: number) => void;
};

const VoiceContext = createContext<VoiceContextType | null>(null);

export type VoiceProviderProps = PropsWithChildren<SocketConfig> & {
  sessionSettings?: Hume.empathicVoice.SessionSettings;
  onMessage?: (message: JSONMessage) => void;
  onError?: (err: VoiceError) => void;
  onOpen?: () => void;
  onClose?: Hume.empathicVoice.chat.ChatSocket.EventHandlers['close'];
  onToolCall?: ToolCallHandler;
  onAudioReceived?: (audioOutputMessage: AudioOutputMessage) => void;
  onAudioStart?: (clipId: string) => void;
  onAudioEnd?: (clipId: string) => void;
  onInterruption?: (
    message: UserTranscriptMessage | UserInterruptionMessage,
  ) => void;
  /**
   * @default true
   * @description Clear messages when the voice is disconnected.
   */
  clearMessagesOnDisconnect?: boolean;
  /**
   * @default 100
   * @description The maximum number of messages to keep in memory.
   */
  messageHistoryLimit?: number;
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoice must be used within an VoiceProvider');
  }
  return ctx;
};

export const VoiceProvider: FC<VoiceProviderProps> = ({
  children,
  clearMessagesOnDisconnect = true,
  messageHistoryLimit = 100,
  sessionSettings,
  verboseTranscription = true,
  ...props
}) => {
  const {
    timestamp: callDurationTimestamp,
    start: startTimer,
    stop: stopTimer,
  } = useCallDuration();

  const [status, setStatus] = useState<VoiceStatus>({
    value: 'disconnected',
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const [connectOptions, setConnectOptions] = useState<ConnectOptions | null>(
    null,
  );

  // error handling
  const [error, setError] = useState<VoiceError | null>(null);
  const isError = error !== null;
  const isMicrophoneError = error?.type === 'mic_error';
  const isSocketError = error?.type === 'socket_error';
  const isAudioError = error?.type === 'audio_error';

  const connectRef = useRef(() => {});

  const onError = useRef(props.onError ?? noop);
  onError.current = props.onError ?? noop;

  const onClose = useRef(props.onClose ?? noop);
  onClose.current = props.onClose ?? noop;

  const onMessage = useRef(props.onMessage ?? noop);
  onMessage.current = props.onMessage ?? noop;

  const onAudioReceived = useRef(props.onAudioReceived ?? noop);
  onAudioReceived.current = props.onAudioReceived ?? noop;

  const onAudioStart = useRef(props.onAudioStart ?? noop);
  onAudioStart.current = props.onAudioStart ?? noop;

  const onAudioEnd = useRef(props.onAudioEnd ?? noop);
  onAudioEnd.current = props.onAudioEnd ?? noop;

  const onInterruption = useRef(props.onInterruption ?? noop);
  onInterruption.current = props.onInterruption ?? noop;

  const toolStatus = useToolStatus();

  const messageStore = useMessages({
    sendMessageToParent: onMessage.current,
    messageHistoryLimit,
  });

  const updateError = useCallback((err: VoiceError | null) => {
    setError(err);
    if (err !== null) {
      onError.current?.(err);
    }
  }, []);

  const onClientError: NonNullable<
    Parameters<typeof useVoiceClient>[0]['onClientError']
  > = useCallback(
    (msg, err) => {
      stopTimer();
      const message = `A websocket connection could not be established. Error message: ${msg ?? 'unknown'}`;
      updateError({ type: 'socket_error', message, error: err });
    },
    [stopTimer, updateError],
  );

  const config = props;

  const micStopFnRef = useRef<null | (() => void)>(null);
  const micStartFnRef = useRef<null | (() => void)>(null);

  const player = useSoundPlayer({
    onError: (message) => {
      updateError({ type: 'audio_error', message });
    },
    onPlayAudio: (id: string) => {
      messageStore.onPlayAudio(id);
      onAudioStart.current(id);
    },
    onStopAudio: (id: string) => {
      onAudioEnd.current(id);
    },
  });
  const [shouldStopPlayer, setShouldStopPlayer] = useState(false);

  useEffect(() => {
    if (
      shouldStopPlayer &&
      (player.queueLength === 0 || status.value === 'error')
    ) {
      player.stopAll();
      setShouldStopPlayer(false);
    }
  }, [shouldStopPlayer, player.queueLength, player, status.value]);

  const handleResourceCleanup = useCallback(
    (forceStop?: boolean) => {
      if (forceStop) {
        player.stopAll();
      } else {
        setShouldStopPlayer(true);
      }
      if (micStopFnRef.current !== null) {
        micStopFnRef.current();
      }
      if (clearMessagesOnDisconnect) {
        messageStore.clearMessages();
      }
      toolStatus.clearStore();
      setIsPaused(false);
    },
    [clearMessagesOnDisconnect, toolStatus, player, messageStore],
  );

  const { streamRef, getStream, permission: micPermission } = useEncoding();

  const initializeMicrophone = useCallback(() => {
    // stop any currently running microphone stream
    micStopFnRef.current?.();

    // then start the microphone.
    // we need to call getStream here to ensure that the microphone is initialized
    // with a fresh stream with new audio headers (audio headers are only present
    // at the start of the stream).
    return getStream(connectOptions?.audioConstraints)
      .then(() => {
        micStartFnRef.current?.();
      })
      .catch((e) => {
        const error: VoiceError = {
          type: 'mic_error',
          message:
            e instanceof Error
              ? e.message
              : 'The microphone could not be initialized.',
        };
        updateError(error);
      });
  }, [getStream, connectOptions, updateError]);

  const initializeAudioPlayer = useCallback(() => {
    try {
      return player.initPlayer();
    } catch (e) {
      const error: VoiceError = {
        type: 'audio_error',
        message:
          e instanceof Error
            ? e.message
            : 'The audio player could not be initialized.',
      };
      updateError(error);
    }
  }, [player, updateError]);

  // Create a ref to store socket closing, which we will need on disconnect
  // when the consumer initiates the closure;
  const socketDisconnectRef = useRef(() => {});

  // The disconnect function now handles all disconnection cases:
  // 1. If the consumer initiates the disconnection, we want to clean up all resources immediately
  //    and set the status to disconnected. This is the default case with no options.
  // 2. If the closure is initiated by the server, we want to clean up some resources,
  //    set the status to disconnected, but wait on the queue being empty before stopping the player.
  //    In this case, skipSocketClose is set to true, since the closure is initiated by the client,
  //    and we are already in the onClose callback.
  // 3. If the socket closes with an error, we want to clean up resources immediately and set the status to error
  // This function is not called when the socket is attempting to reconnect,
  const disconnectAndCleanup = useCallback(
    (options?: {
      isError?: boolean;
      errorMessage?: string;
      skipSocketClose?: boolean;
    }) => {
      const consumerInitiated = options === undefined;
      const forceStop = consumerInitiated || options?.isError;

      stopTimer();

      if (!options?.skipSocketClose) {
        socketDisconnectRef.current();
      }

      handleResourceCleanup(forceStop);

      setConnectOptions(null);

      if (options?.isError && options?.errorMessage) {
        setStatus({ value: 'error', reason: options?.errorMessage });
      } else if (!options?.isError) {
        setStatus({ value: 'disconnected' });
      }
    },
    [stopTimer, handleResourceCleanup],
  );

  // This function is the only one exposed to the consumer;
  // it refers to the default case of disconnectAndCleanup,
  // which disconnects the socket and cleans up resources immediately;
  // All other uses of disconnectAndCleanup, determined by arguments passed,
  // are internal.
  const disconnect = useCallback(() => {
    disconnectAndCleanup();
  }, [disconnectAndCleanup]);

  const client = useVoiceClient({
    onAudioMessage: (message: AudioOutputMessage) => {
      player.addToQueue(message);
      onAudioReceived.current(message);
    },
    onMessage: useCallback(
      (message: JSONMessage) => {
        // store message
        messageStore.onMessage(message);

        if (
          message.type === 'user_interruption' ||
          message.type === 'user_message'
        ) {
          if (player.isPlaying) {
            onInterruption.current(message);
          }
          player.clearQueue();
        }

        if (
          message.type === 'tool_call' ||
          message.type === 'tool_response' ||
          message.type === 'tool_error'
        ) {
          toolStatus.addToStore(message);
        }
      },
      [messageStore, player, toolStatus],
    ),
    onClientError,
    onToolCallError: useCallback(
      (message: string, err?: Error) => {
        const error: VoiceError = {
          type: 'socket_error',
          message,
          error: err,
        };
        updateError(error);
      },
      [updateError],
    ),
    onOpen: useCallback(() => {
      startTimer();
      void initializeMicrophone().then(() => {
        messageStore.createConnectMessage();
        setIsReconnecting(false);
        props.onOpen?.();
        setShouldStopPlayer(false);
        setStatus({ value: 'connected' });
      });
    }, [initializeMicrophone, messageStore, props, startTimer]),
    onClose: useCallback<
      NonNullable<Hume.empathicVoice.chat.ChatSocket.EventHandlers['close']>
    >(
      (event) => {
        messageStore.createDisconnectMessage(event);
        if (event.willReconnect) {
          stopTimer();
          setIsReconnecting(true);
        } else {
          disconnectAndCleanup({
            isError: Boolean(error),
            errorMessage: error?.message || 'Unknown error',
            skipSocketClose: true,
          });
        }

        onClose.current?.(event);
      },
      [messageStore, stopTimer, error, disconnectAndCleanup],
    ),
    onToolCall: props.onToolCall,
  });

  const {
    sendAudio: clientSendAudio,
    sendUserInput: clientSendUserInput,
    sendAssistantInput: clientSendAssistantInput,
    sendSessionSettings: clientSendSessionSettings,
    sendToolMessage: clientSendToolMessage,
    sendPauseAssistantMessage,
    sendResumeAssistantMessage,
  } = client;

  useEffect(() => {
    socketDisconnectRef.current = client.disconnect;
  }, [client]);

  const mic = useMicrophone({
    streamRef,
    onAudioCaptured: useCallback(
      (arrayBuffer) => {
        try {
          clientSendAudio(arrayBuffer);
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          updateError({ type: 'socket_error', message });
        }
      },
      [clientSendAudio, updateError],
    ),
    onError: useCallback(
      (message) => {
        updateError({ type: 'mic_error', message });
      },
      [updateError],
    ),
  });

  useEffect(() => {
    micStartFnRef.current = mic.start;
    micStopFnRef.current = mic.stop;
  }, [mic]);

  const { clearQueue } = player;

  const pauseAssistant = useCallback(() => {
    try {
      sendPauseAssistantMessage();
      setIsPaused(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      updateError({ type: 'socket_error', message });
    }
    clearQueue();
  }, [sendPauseAssistantMessage, clearQueue, updateError]);

  const resumeAssistant = useCallback(() => {
    try {
      sendResumeAssistantMessage();
      setIsPaused(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      updateError({ type: 'socket_error', message });
    }
  }, [sendResumeAssistantMessage, updateError]);

  const connect = useCallback(
    async (options: ConnectOptions = {}) => {
      updateError(null);
      setStatus({ value: 'connecting' });
      setConnectOptions(options);
      const permission = await getStream(options.audioConstraints);

      if (permission === 'denied') {
        const message = 'Microphone permission denied';
        const error: VoiceError = { type: 'mic_error', message };
        updateError(error);
        return;
      }

      try {
        await client.connect({
          ...config,
          verboseTranscription: true,
        });
      } catch (e) {
        // catching the thrown error here so we can return early from the connect function,
        // but the error itself is handled in the `onClientError` callback on the client
        return;
      }

      await initializeAudioPlayer();

      // mic is initialized in the onOpen callback of the websocket client because the
      // microphone stream needs to be initialized every time a new websocket connection is made.
      // if we initialize the microphone here, the mic stream will only start when the user
      // calls "connect", and will not restart when the websocket connection disconnects
      // and automatically reconnects.
    },
    [client, config, getStream, initializeAudioPlayer, updateError],
  );

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (
      error !== null &&
      status.value !== 'error' &&
      status.value !== 'disconnected'
    ) {
      disconnectAndCleanup({
        isError: true,
        errorMessage: error.message,
      });
    }
  }, [error, status.value, disconnectAndCleanup]);

  useEffect(() => {
    return () => {
      disconnectAndCleanup({ isError: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendUserInput = useCallback(
    (text: string) => {
      try {
        clientSendUserInput(text);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        updateError({ type: 'socket_error', message });
      }
    },
    [clientSendUserInput, updateError],
  );

  const sendAssistantInput = useCallback(
    (text: string) => {
      try {
        clientSendAssistantInput(text);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        updateError({ type: 'socket_error', message });
      }
    },
    [clientSendAssistantInput, updateError],
  );

  const sendSessionSettings = useCallback(
    (sessionSettings: Hume.empathicVoice.SessionSettings) => {
      try {
        clientSendSessionSettings(sessionSettings);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        updateError({ type: 'socket_error', message });
      }
    },
    [clientSendSessionSettings, updateError],
  );

  useEffect(() => {
    if (
      client.readyState === VoiceReadyState.OPEN &&
      sessionSettings !== undefined &&
      Object.keys(sessionSettings).length > 0
    ) {
      sendSessionSettings(sessionSettings);
    }
  }, [client.readyState, sendSessionSettings, sessionSettings]);

  const sendToolMessage = useCallback(
    (
      message:
        | Hume.empathicVoice.ToolResponseMessage
        | Hume.empathicVoice.ToolErrorMessage,
    ) => {
      try {
        clientSendToolMessage(message);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        updateError({ type: 'socket_error', message });
      }
    },
    [clientSendToolMessage, updateError],
  );

  const ctx = useMemo(
    () =>
      ({
        connect,
        disconnect,
        fft: player.fft,
        micFft: mic.fft,
        isMuted: mic.isMuted,
        isAudioMuted: player.isAudioMuted,
        isPlaying: player.isPlaying,
        isReconnecting,
        messages: messageStore.messages,
        lastVoiceMessage: messageStore.lastVoiceMessage,
        lastUserMessage: messageStore.lastUserMessage,
        clearMessages: messageStore.clearMessages,
        mute: mic.mute,
        muteAudio: player.muteAudio,
        readyState: client.readyState,
        sendUserInput,
        sendAssistantInput,
        sendSessionSettings,
        pauseAssistant,
        resumeAssistant,
        sendToolMessage,
        status,
        unmute: mic.unmute,
        unmuteAudio: player.unmuteAudio,
        error,
        isAudioError,
        isError,
        isMicrophoneError,
        isSocketError,
        callDurationTimestamp,
        toolStatusStore: toolStatus.store,
        chatMetadata: messageStore.chatMetadata,
        playerQueueLength: player.queueLength,
        isPaused,
        volume: player.volume,
        setVolume: player.setVolume,
      }) satisfies VoiceContextType,
    [
      connect,
      disconnect,
      player.fft,
      player.isAudioMuted,
      player.isPlaying,
      player.muteAudio,
      player.unmuteAudio,
      player.queueLength,
      player.volume,
      player.setVolume,
      mic.fft,
      mic.isMuted,
      mic.mute,
      mic.unmute,
      messageStore.messages,
      messageStore.lastVoiceMessage,
      messageStore.lastUserMessage,
      messageStore.clearMessages,
      messageStore.chatMetadata,
      client.readyState,
      sendUserInput,
      sendAssistantInput,
      sendSessionSettings,
      pauseAssistant,
      resumeAssistant,
      sendToolMessage,
      status,
      error,
      isAudioError,
      isError,
      isMicrophoneError,
      isSocketError,
      callDurationTimestamp,
      toolStatus.store,
      isPaused,
      isReconnecting,
    ],
  );

  return <VoiceContext.Provider value={ctx}>{children}</VoiceContext.Provider>;
};
