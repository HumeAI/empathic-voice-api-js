import ReconnectingWebsocket from 'reconnecting-websocket';

import type { Config } from './create-config';
import { createSocketUrl } from './create-url';
import type { Message } from './message';
import { parseMessageType } from './message';

export type AssistantEventMap = {
  open?: () => void;
  message?: (message: Message) => void;
  close?: () => void;
  error?: (error: Error) => void;
};

export class AssistantClient {
  private socket: ReconnectingWebsocket;

  private url: string;

  private eventHandlers: AssistantEventMap = {};

  private constructor(config: Config) {
    this.url = createSocketUrl(config);
    this.socket = new ReconnectingWebsocket(this.url, [], {
      startClosed: true,
      maxRetries: config.reconnectAttempts,
      debug: config.debug,
    });
  }

  /**
   * Create a new AssistantClient.
   */
  static create(config: Config) {
    return new AssistantClient(config);
  }

  /**
   * Attach events to the client.
   */
  on<T extends keyof AssistantEventMap>(
    event: T,
    callback: AssistantEventMap[T],
  ) {
    this.eventHandlers[event] = callback;
  }

  /**
   * Connect to the websocket.
   */
  connect() {
    this.socket.reconnect();

    this.socket.addEventListener('open', () => {
      this.eventHandlers.open?.();
    });

    this.socket.addEventListener('message', (event) => {
      void parseMessageType(event).then((result) => {
        if (result.success) {
          this.eventHandlers.message?.(result.message);
        } else {
          this.eventHandlers.error?.(result.error);
        }
      });
    });

    this.socket.addEventListener('close', () => {
      this.eventHandlers.close?.();
    });

    this.socket.addEventListener('error', () => {
      this.eventHandlers.error?.(new Error('WebSocket error.'));
    });

    return this;
  }

  /**
   * Disconnect from the websocket.
   */
  disconnect() {
    this.socket?.close();
  }

  /**
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
   * The current ready state of the socket.
   */
  get readyState() {
    return this.socket.readyState;
  }
}
