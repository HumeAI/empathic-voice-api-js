import ReconnectingWebsocket from 'reconnecting-websocket';

import type { Config } from './create-config';
import { createSocketUrl } from './create-url';
import { parseMessageType } from './message';

import type { AudioMessage } from '@/models/audio-message';
import type { JSONMessage } from '@/models/json-message';

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
  close?: () => void;
  error?: (error: Error) => void;
};

export class VoiceClient {
  private socket: ReconnectingWebsocket;

  private url: string;

  private eventHandlers: VoiceEventMap = {};

  private constructor(config: Config) {
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
  static create(config: Config) {
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

  private handleClose = () => {
    this.eventHandlers.close?.();
  };

  private handleError = () => {
    this.eventHandlers.error?.(new Error('WebSocket error.'));
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
    // Remove event listeners before closing the socket
    this.socket.removeEventListener('open', this.handleOpen);
    this.socket.removeEventListener('message', this.handleMessage);
    this.socket.removeEventListener('close', this.handleClose);
    this.socket.removeEventListener('error', this.handleError);

    // Close socket
    this.socket?.close();
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
   * @name sendText
   * @description
   * Send text data to the websocket.
   */
  sendText(text: string) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    const json = JSON.stringify({ text });

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
