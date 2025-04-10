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
  connect: () => Promise<void>;
  disconnect: () => void;
  handleDeviceChange: () => Promise<void>;
  fft: number[];
  isMuted: boolean;
  isAudioMuted: boolean;
  isPlaying: boolean;
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
  /**
   * @description Optional device ID to use for input. If not provided, the default microphone will be used.
   */
  microphoneDeviceId?: string;
  /**
   * @description Optional device ID to use for output. If not provided, the default speaker will be used.
   */
  speakerDeviceId?: string;
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
  microphoneDeviceId,
  speakerDeviceId,
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

  // error handling
  const [error, setError] = useState<VoiceError | null>(null);
  const isError = error !== null;
  const isMicrophoneError = error?.type === 'mic_error';
  const isSocketError = error?.type === 'socket_error';
  const isAudioError = error?.type === 'audio_error';

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
    Parameters<typeof useVoiceClient>[0]['onError']
  > = useCallback(
    (message, err) => {
      stopTimer();
      updateError({ type: 'socket_error', message, error: err });
    },
    [stopTimer, updateError],
  );

  const config = props;

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
    speakerDeviceId,
  });

  const {
    streamRef,
    getStream,
    permission: micPermission,
  } = useEncoding(microphoneDeviceId);

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
    onError: onClientError,
    onOpen: useCallback(() => {
      startTimer();
      messageStore.createConnectMessage();
      props.onOpen?.();
    }, [messageStore, props, startTimer]),
    onClose: useCallback<
      NonNullable<Hume.empathicVoice.chat.ChatSocket.EventHandlers['close']>
    >(
      (event) => {
        stopTimer();
        messageStore.createDisconnectMessage(event);
        onClose.current?.(event);
      },
      [messageStore, stopTimer],
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
    deviceId: microphoneDeviceId,
  });

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

  const connect = useCallback(async () => {
    const startTime = performance.now();
    updateError(null);
    setStatus({ value: 'connecting' });

    console.log('Starting connection process...');
    const permissionStart = performance.now();
    console.log('Requesting microphone permission...');
    const permission = await getStream();
    console.log(
      `Microphone permission took ${performance.now() - permissionStart}ms`,
    );

    if (permission === 'denied') {
      const message = 'Microphone access denied';
      const error: VoiceError = { type: 'mic_error', message };
      updateError(error);
      setStatus({ value: 'error', reason: message });
      return Promise.reject(new Error(message));
    }

    try {
      const socketStart = performance.now();
      console.log('Connecting to voice service...');
      await client.connect({
        ...config,
        verboseTranscription: true,
      });
      console.log(
        `WebSocket connection took ${performance.now() - socketStart}ms`,
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error('Voice connection error:', errorMessage);
      const error: VoiceError = {
        type: 'socket_error',
        message: 'Unable to connect to service',
        error: e instanceof Error ? e : undefined,
      };
      updateError(error);
      setStatus({ value: 'error', reason: errorMessage });
      return Promise.reject(new Error(errorMessage));
    }

    try {
      const audioStart = performance.now();
      console.log('Initializing audio components...');
      // Initialize both components in parallel
      const [playerResult, micResult] = await Promise.allSettled([
        player.initPlayer(),
        mic.start(),
      ]);
      console.log(
        `Audio initialization took ${performance.now() - audioStart}ms`,
      );

      // Handle player initialization result
      if (playerResult.status === 'rejected') {
        console.warn('Player initialization warning:', playerResult.reason);
        // Continue as player errors are not critical
      }

      // Handle microphone initialization result
      if (micResult.status === 'rejected') {
        const micError = micResult.reason;
        console.error('Failed to start microphone:', micError);
        const error: VoiceError = {
          type: 'mic_error',
          message: 'Unable to start microphone',
        };
        updateError(error);
        setStatus({ value: 'error', reason: error.message });
        return Promise.reject(new Error(error.message));
      }

      // Set connected status regardless of individual component results
      setStatus({ value: 'connected' });
      console.log(`Total connection time: ${performance.now() - startTime}ms`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error('Audio initialization error:', errorMessage);
      const error: VoiceError = {
        type: 'audio_error',
        message: 'Unable to initialize audio',
        error: e instanceof Error ? e : undefined,
      };
      updateError(error);
      setStatus({ value: 'error', reason: errorMessage });
      return Promise.reject(new Error(errorMessage));
    }
  }, [client, config, getStream, mic, player, updateError]);

  const disconnectFromVoice = useCallback(() => {
    if (client.readyState !== VoiceReadyState.CLOSED) {
      client.disconnect();
    }
    player.stopAll();
    mic.stop();
    if (clearMessagesOnDisconnect) {
      messageStore.clearMessages();
    }
    toolStatus.clearStore();
    setIsPaused(false);
  }, [
    client,
    player,
    mic,
    clearMessagesOnDisconnect,
    toolStatus,
    messageStore,
  ]);

  const disconnect = useCallback(
    (disconnectOnError?: boolean) => {
      if (micPermission === 'denied') {
        setStatus({ value: 'error', reason: 'Microphone permission denied' });
      }

      stopTimer();

      disconnectFromVoice();

      if (status.value !== 'error' && !disconnectOnError) {
        // if status was 'error', keep the error status so we can show the error message to the end user.
        // otherwise, set status to 'disconnected'
        setStatus({ value: 'disconnected' });
      }
    },
    [micPermission, stopTimer, disconnectFromVoice, status.value],
  );

  useEffect(() => {
    if (
      error !== null &&
      status.value !== 'error' &&
      status.value !== 'disconnected'
    ) {
      // If the status is ever set to `error`, disconnect the voice.
      setStatus({ value: 'error', reason: error.message });
      disconnectFromVoice();
    }
  }, [status.value, disconnect, disconnectFromVoice, error]);

  useEffect(() => {
    // disconnect from socket when the voice provider component unmounts
    return () => {
      disconnectFromVoice();
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

  // Handle microphone device changes
  const isHandlingDeviceChange = useRef(false);
  const lastDeviceId = useRef(microphoneDeviceId);

  const handleDeviceChange = useCallback(async () => {
    if (isHandlingDeviceChange.current) return;
    isHandlingDeviceChange.current = true;

    try {
      // First disconnect everything
      disconnectFromVoice();

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get a new stream with the updated device ID
      const permission = await getStream();
      if (permission === 'denied') {
        throw new Error('Microphone access denied');
      }

      // Start fresh connection with new device
      await connect();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error('Failed to handle device change:', errorMessage);
      const error: VoiceError = {
        type: 'socket_error',
        message: 'Unable to handle device change',
        error: e instanceof Error ? e : undefined,
      };
      updateError(error);
      setStatus({ value: 'error', reason: errorMessage });
    } finally {
      isHandlingDeviceChange.current = false;
    }
  }, [connect, disconnectFromVoice, getStream, updateError]);

  const ctx = useMemo(
    () =>
      ({
        connect,
        disconnect,
        handleDeviceChange,
        fft: player.fft,
        micFft: mic.fft,
        isMuted: mic.isMuted,
        isAudioMuted: player.isAudioMuted,
        isPlaying: player.isPlaying,
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
      }) satisfies VoiceContextType,
    [
      connect,
      disconnect,
      handleDeviceChange,
      player.fft,
      player.isAudioMuted,
      player.isPlaying,
      player.muteAudio,
      player.unmuteAudio,
      player.queueLength,
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
    ],
  );

  return <VoiceContext.Provider value={ctx}>{children}</VoiceContext.Provider>;
};
