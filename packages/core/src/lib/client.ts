import ReconnectingWebsocket, {
  type CloseEvent,
  type ErrorEvent as WebsocketErrorEvent,
} from 'reconnecting-websocket';
import snakecaseKeys from 'snakecase-keys';

import type { SocketConfig } from './create-socket-config';
import { createSocketUrl } from './create-url';
import { parseMessageType } from './message';

import type { AudioMessage } from '@/models/audio-message';
import type { JSONMessage } from '@/models/json-message';
import { type SessionSettings } from '@/models/session-settings';

/**
 * @name VoiceEventMap
 * @description
 * The event map for the VoiceClient.
 * @type
 * An object with the following properties:
 * - `open` - The event to run when the socket is opened.
 * - `message` - The event to run when a message is received.
 * - `close` - The event to run when the socket is closed.
 * - `error` - The event to run when an error occurs.
 */
export type VoiceEventMap = {
  open?: () => void;
  message?: (message: JSONMessage | AudioMessage) => void;
  close?: (event: CloseEvent) => void;
  error?: (error: Error) => void;
};

export class VoiceClient {
  private socket: ReconnectingWebsocket;

  private url: string;

  private eventHandlers: VoiceEventMap = {};

  private constructor(config: SocketConfig) {
    this.url = createSocketUrl(config);
    this.socket = new ReconnectingWebsocket(this.url, [], {
      startClosed: true,
      maxRetries: config.reconnectAttempts,
      debug: config.debug,
    });
  }

  /**
   * @name create
   * @description
   * Create a new VoiceClient.
   * @param config - The configuration for the client.
   * @returns
   * A new VoiceClient instance.
   * @example
   * ```ts
   * const client = VoiceClient.create(config);
   * ```
   */
  static create(config: SocketConfig) {
    return new VoiceClient(config);
  }

  /**
   * @name on
   * @description
   * Attach events to the client.
   * @param event - The event to attach to.
   * @param callback - The callback to run when the event is triggered.
   * @returns
   * The VoiceClient instance.
   * @example
   * ```ts
   * const client = VoiceClient.create(config);
   * client.on('open', () => {
   *  console.log('Socket opened');
   * });
   * ```
   */
  on<T extends keyof VoiceEventMap>(event: T, callback: VoiceEventMap[T]) {
    this.eventHandlers[event] = callback;
  }

  private handleOpen = () => {
    this.eventHandlers.open?.();
  };

  private handleMessage = (event: MessageEvent) => {
    void parseMessageType(event).then((result) => {
      if (result.success) {
        this.eventHandlers.message?.(result.message);
      } else {
        this.eventHandlers.error?.(result.error);
      }
    });
  };

  private handleClose = (event: CloseEvent) => {
    this.eventHandlers.close?.(event);
  };

  private handleError = (e: WebsocketErrorEvent) => {
    const message = e.message ?? 'WebSocket error';
    this.eventHandlers.error?.(new Error(message));
  };

  /**
   * @name connect
   * @description
   * Connect to the websocket.
   */
  connect() {
    this.socket.reconnect();

    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('error', this.handleError);

    return this;
  }

  /**
   * @name disconnect
   * @description
   * Disconnect from the websocket.
   */
  disconnect() {
    // Close socket before removing event listeners so that "onClose" is still called
    this.socket?.close();

    this.handleClose({ code: 1000 } as CloseEvent);

    // Remove event listeners
    this.socket.removeEventListener('open', this.handleOpen);
    this.socket.removeEventListener('message', this.handleMessage);
    this.socket.removeEventListener('close', this.handleClose);
    this.socket.removeEventListener('error', this.handleError);
  }

  /**
   * @name sendAudio
   * @description
   * Send audio data to the websocket.
   */
  sendAudio(audioBuffer: ArrayBufferLike) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    this.socket.send(audioBuffer);
  }

  /**
   * @name sendUserInput
   * @description
   * Send text data to the websocket.
   */
  sendUserInput(text: string) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    const json = JSON.stringify({ text, type: 'user_input' });

    this.socket.send(json);
  }

  /**
   * @name sendAssistantInput
   * @description
   * Send text data to the websocket for TTS.
   */
  sendAssistantInput(text: string) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    const json = JSON.stringify({ text, type: 'assistant_input' });

    this.socket.send(json);
  }

  /**
   * @name sendSessionSettings
   * @description
   * Send session settings to the websocket
   */
  sendSessionSettings(sessionSettings: SessionSettings) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    const snakeCaseSettings = snakecaseKeys(sessionSettings);

    const json = JSON.stringify({
      ...snakeCaseSettings,
      type: 'session_settings',
    });
    this.socket.send(json);
  }

  /**
   * @name readyState
   * @description
   * The current ready state of the socket.
   */
  get readyState() {
    return this.socket.readyState;
  }
}
