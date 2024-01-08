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
